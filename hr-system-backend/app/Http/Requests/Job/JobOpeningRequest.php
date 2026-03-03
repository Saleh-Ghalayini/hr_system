<?php

namespace App\Http\Requests\Job;

use App\Http\Requests\BaseFormRequest;

class JobOpeningRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'title'       => "{$required}|string|max:255",
            'department'  => "{$required}|string|max:255",
            'description' => "{$required}|string",
            'status'      => 'sometimes|in:open,closed,on_hold',
        ];
    }
}
