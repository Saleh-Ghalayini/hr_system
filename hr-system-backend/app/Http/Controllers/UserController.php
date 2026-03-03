<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    use ApiResponse;

    public function updateUserBasicInfo(Request $request)
    {
        $data = $request->validate([
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'date_of_birth' => 'sometimes|date|before:today',
            'nationality'   => 'sometimes|string|max:100',
            'phone_number'  => 'sometimes|string|max:20',
            'address'       => 'sometimes|string|max:255',
            'position'      => 'sometimes|string|max:100',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->update($data);

        return $this->success($user, 'Profile updated successfully.');
    }

    public function updateJobDetails(Request $request)
    {
        $data = $request->validate([
            'title'             => 'sometimes|string|max:255',
            'employment_type'   => 'sometimes|in:full_time,part_time,contract,internship',
            'employment_status' => 'sometimes|in:active,on_leave,terminated',
            'employee_level'    => 'sometimes|string|max:100',
            'work_location'     => 'sometimes|in:on_site,remote,hybrid',
            'hiring_date'       => 'sometimes|date',
        ]);

        /** @var \App\Models\User $user */
        $user      = Auth::user();
        $jobDetail = $user->jobDetail;

        if (!$jobDetail) {
            return $this->notFound('Job details not found.');
        }

        $jobDetail->update($data);

        return $this->success($jobDetail, 'Job details updated successfully.');
    }

    public function getUserJobDetails()
    {
        /** @var \App\Models\User $user */
        $user      = Auth::user();
        $jobDetail = $user->jobDetail;

        if (!$jobDetail) {
            return $this->notFound('Job details not found.');
        }

        return $this->success([
            'user'       => $user->only(['id', 'first_name', 'last_name', 'email', 'position', 'gender']),
            'job_detail' => $jobDetail,
        ]);
    }

    public function uploadProfilePhoto(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
        ]);

        $image = $request->input('image');

        if (!preg_match('/^data:(image\/(jpeg|png|webp|gif));base64,/i', $image, $matches)) {
            return $this->error('Invalid image format. Only JPEG, PNG, WebP, and GIF are allowed.', 422);
        }

        $mimeType  = strtolower($matches[1]);
        $raw       = str_replace(' ', '+', substr($image, strpos($image, ',') + 1));
        $imageData = base64_decode($raw, true);

        if ($imageData === false) {
            return $this->error('Invalid base64 image data.', 422);
        }

        if (strlen($imageData) > 2 * 1024 * 1024) {
            return $this->error('Image exceeds the 2 MB size limit.', 422);
        }

        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
        ];
        $ext      = $extensions[$mimeType] ?? 'jpg';
        $fileName = 'profile_' . Auth::id() . '_' . time() . '.' . $ext;

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->profile_url && Storage::disk('public')->exists($user->profile_url)) {
            Storage::disk('public')->delete($user->profile_url);
        }

        Storage::disk('public')->put('profile_photos/' . $fileName, $imageData);

        $user->profile_url = 'profile_photos/' . $fileName;
        $user->save();

        return $this->success(
            ['photo_url' => url('storage/profile_photos/' . $fileName)],
            'Profile photo uploaded successfully.'
        );
    }

    public function getImageUrl()
    {
        return $this->success(['photo_url' => Auth::user()->profile_url]);
    }

    public function enrollments()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $enrollments = $user->enrollments()
            ->with('course:id,course_name,description,duration_hours,certificate_text')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(Enrollment $e) => [
                'id'                   => $e->id,
                'course_name'          => $e->course->course_name ?? null,
                'start_date'           => $e->start_date,
                'end_date'             => $e->end_date,
                'status'               => $e->status,
                'progress'             => match ($e->status) {
                    'completed'   => 100,
                    'in_progress' => 50,
                    'terminated'  => 0,
                    default       => 25,
                },
                'certificate_eligible' => $e->status === 'completed',
            ]);

        return $this->success([
            'enrollments' => $enrollments,
            'total'       => $enrollments->count(),
        ]);
    }
}
