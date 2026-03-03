<?php

namespace App\Http\Requests\Enrollment;

use App\Http\Requests\BaseFormRequest;

class StoreEnrollmentRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'user_id'    => 'required|exists:users,id',
            'course_id'  => 'required|exists:courses,id',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'status'     => 'sometimes|in:enrolled,in_progress,completed,terminated',
        ];
    }
}
