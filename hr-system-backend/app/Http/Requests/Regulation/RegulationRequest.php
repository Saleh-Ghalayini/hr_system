<?php

namespace App\Http\Requests\Regulation;

use App\Http\Requests\BaseFormRequest;

class RegulationRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name'        => "{$required}|string|max:255",
            'description' => 'nullable|string',
            'category'    => 'nullable|string|max:100',
        ];
    }
}
