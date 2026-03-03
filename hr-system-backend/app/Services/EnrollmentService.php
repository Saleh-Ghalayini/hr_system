<?php

namespace App\Services;

use App\Models\Enrollment;

class EnrollmentService
{
    public function store(array $data): Enrollment
    {
        $existing = Enrollment::where('user_id', $data['user_id'])
            ->where('course_id', $data['course_id'])
            ->whereNotIn('status', ['terminated'])
            ->first();

        if ($existing) {
            abort(400, 'User is already enrolled in this course.');
        }

        return Enrollment::create($data);
    }

    public function update(Enrollment $enrollment, array $data): Enrollment
    {
        if (isset($data['user_id']) || isset($data['course_id'])) {
            $userId   = $data['user_id']   ?? $enrollment->user_id;
            $courseId = $data['course_id'] ?? $enrollment->course_id;

            $duplicate = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->where('id', '!=', $enrollment->id)
                ->whereNotIn('status', ['terminated'])
                ->first();

            if ($duplicate) {
                abort(400, 'User is already enrolled in this course.');
            }
        }

        $enrollment->update($data);

        return $enrollment;
    }
}
