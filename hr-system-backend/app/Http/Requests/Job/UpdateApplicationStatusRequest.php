<?php

namespace App\Http\Requests\Job;

use App\Http\Requests\BaseFormRequest;

class UpdateApplicationStatusRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'status'         => 'required|in:applied,interviewed,hired,rejected',
            'interview_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ];
    }
}
