<?php

namespace App\Http\Requests\Enrollment;

use App\Http\Requests\BaseFormRequest;

class UpdateEnrollmentRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'user_id'    => 'sometimes|exists:users,id',
            'course_id'  => 'sometimes|exists:courses,id',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
            'status'     => 'sometimes|in:enrolled,in_progress,completed,terminated',
        ];
    }
}
