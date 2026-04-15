<?php

namespace App\Http\Requests\Enrollment;

use App\Http\Requests\BaseFormRequest;

class UpdateMyEnrollmentProgressRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'progress_percentage' => 'required|integer|min:0|max:95',
        ];
    }
}
