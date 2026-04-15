<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Services\ProfileService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use App\Http\Requests\Enrollment\UpdateMyEnrollmentProgressRequest;
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
            'id',
            'first_name',
            'last_name',
            'email',
            'position',
            'gender',
            'date_of_birth',
            'nationality',
            'phone_number',
            'address',
            'profile_url',
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
                'start_date'           => $e->start_date?->format('Y-m-d'),
                'end_date'             => $e->end_date?->format('Y-m-d'),
                'status'               => $e->status,
                'progress'             => $this->calculateEnrollmentProgress($e),
                'progress_percentage'  => $e->progress_percentage,
                'certificate_eligible' => $e->status === 'completed',
            ]);

        return $this->success([
            'enrollments' => $enrollments,
            'total'       => $enrollments->count(),
        ]);
    }

    public function updateMyEnrollmentProgress(UpdateMyEnrollmentProgressRequest $request, Enrollment $enrollment)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ((int) $enrollment->user_id !== (int) $user->id) {
            return $this->forbidden('You can only update your own enrollments.');
        }

        if (in_array($enrollment->status, ['completed', 'terminated'], true)) {
            return $this->error('Progress cannot be updated for completed or terminated enrollments.', 400);
        }

        $progress = (int) $request->validated()['progress_percentage'];

        $updates = [
            'progress_percentage' => $progress,
        ];

        // Keep status and progress consistent once learner activity starts.
        if ($enrollment->status === 'enrolled' && $progress > 0) {
            $updates['status'] = 'in_progress';
        }

        $enrollment->update($updates);

        $enrollment->refresh();

        return $this->success([
            'id' => $enrollment->id,
            'status' => $enrollment->status,
            'progress' => $this->calculateEnrollmentProgress($enrollment),
            'progress_percentage' => $enrollment->progress_percentage,
        ], 'Progress updated successfully.');
    }

    private function calculateEnrollmentProgress(Enrollment $enrollment): int
    {
        if ($enrollment->status === 'completed') {
            return 100;
        }

        if ($enrollment->status === 'terminated') {
            return 0;
        }

        if ($enrollment->progress_percentage !== null) {
            return max(0, min(95, (int) $enrollment->progress_percentage));
        }

        if (!$enrollment->start_date || !$enrollment->end_date) {
            return $enrollment->status === 'in_progress' ? 50 : 0;
        }

        $start = $enrollment->start_date->copy()->startOfDay();
        $end = $enrollment->end_date->copy()->startOfDay();
        $today = Carbon::today();

        if ($today->lte($start)) {
            return 0;
        }

        if ($today->gte($end)) {
            return 95;
        }

        $totalDays = max(1, $start->diffInDays($end));
        $elapsedDays = $start->diffInDays($today);
        $progress = (int) round(($elapsedDays / $totalDays) * 100);

        return max(1, min(95, $progress));
    }
}
