<?php

namespace App\Http\Requests\Course;

use App\Http\Requests\BaseFormRequest;

class CourseRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'course_name'      => "{$required}|string|max:255",
            'description'      => "{$required}|string",
            'skills'           => 'nullable|array',
            'duration_hours'   => "{$required}|integer|min:1",
            'certificate_text' => 'nullable|string|max:1000',
        ];
    }
}
