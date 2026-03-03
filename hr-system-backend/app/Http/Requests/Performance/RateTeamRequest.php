<?php

namespace App\Http\Requests\Performance;

use App\Http\Requests\BaseFormRequest;

class RateTeamRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'type_ids'   => 'required|array|min:1',
            'type_ids.*' => 'required|exists:performance_types,id',
            'rate'       => 'required|array|min:1',
            'rate.*'     => 'required|integer|between:1,5',
            'comment'    => 'nullable|string|max:1000',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (count((array) $this->type_ids) !== count((array) $this->rate)) {
                $v->errors()->add('rate', 'The number of ratings must match the number of type IDs.');
            }
        });
    }
}
