<?php

namespace App\Http\Requests\Job;

use App\Http\Requests\BaseFormRequest;

class ApplyJobRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|max:255',
            'phone'       => 'required|string|max:20',
            'resume_path' => 'nullable|string|max:500',
            'notes'       => 'nullable|string',
        ];
    }
}
