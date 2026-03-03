<?php

namespace App\Http\Requests\Project;

use App\Http\Requests\BaseFormRequest;

class ProjectRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name'        => "{$required}|string|max:255",
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:active,on_hold,completed,cancelled',
        ];
    }
}
