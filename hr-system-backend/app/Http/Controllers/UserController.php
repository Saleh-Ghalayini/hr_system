<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Services\ProfileService;
use App\Traits\ApiResponse;
use App\Http\Requests\User\UpdateBasicInfoRequest;
use App\Http\Requests\User\UpdateJobDetailsRequest;
use App\Http\Requests\User\UploadProfilePhotoRequest;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private ProfileService $profileService) {}

    public function updateUserBasicInfo(UpdateBasicInfoRequest $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->update($request->validated());

        return $this->success($user, 'Profile updated successfully.');
    }

    public function updateJobDetails(UpdateJobDetailsRequest $request)
    {
        /** @var \App\Models\User $user */
        $user      = Auth::user();
        $jobDetail = $user->jobDetail;

        if (!$jobDetail) {
            return $this->notFound('Job details not found.');
        }

        $jobDetail->update($request->validated());

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

        $userData = $user->only([
            'id', 'first_name', 'last_name', 'email', 'position',
            'gender', 'date_of_birth', 'nationality', 'phone_number',
            'address', 'profile_url',
        ]);

        // Return a date-only value to avoid timezone shifting in date inputs.
        $userData['date_of_birth'] = $user->date_of_birth?->format('Y-m-d');

        $jobDetailData = $jobDetail->toArray();
        $jobDetailData['hiring_date'] = $jobDetail->hiring_date?->format('Y-m-d');

        return $this->success([
            'user'       => $userData,
            'job_detail' => $jobDetailData,
        ]);
    }

    public function uploadProfilePhoto(UploadProfilePhotoRequest $request)
    {
        /** @var \App\Models\User $user */
        $user     = Auth::user();
        $photoUrl = $this->profileService->upload($user, $request->input('image'));

        return $this->success(['photo_url' => $photoUrl], 'Profile photo uploaded successfully.');
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
