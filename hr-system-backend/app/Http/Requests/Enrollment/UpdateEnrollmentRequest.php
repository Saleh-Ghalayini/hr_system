<?php

namespace App\Http\Requests\Enrollment;

use App\Http\Requests\BaseFormRequest;
use Carbon\Carbon;
use App\Models\Enrollment;

class UpdateEnrollmentRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'user_id'    => 'sometimes|integer|exists:users,id',
            'course_id'  => 'sometimes|integer|exists:courses,id',
            'start_date' => 'sometimes|date',
            'end_date'   => [
                'sometimes',
                'date',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $startDate = $this->input('start_date');

                    if (!$startDate) {
                        /** @var Enrollment|null $enrollment */
                        $enrollment = $this->route('enrollment');
                        $startDate = $enrollment?->start_date?->format('Y-m-d');
                    }

                    if ($startDate && Carbon::parse((string) $value)->lt(Carbon::parse((string) $startDate))) {
                        $fail('The end date must be a date after or equal to start date.');
                    }
                },
            ],
            'status'     => 'sometimes|in:enrolled,in_progress,completed,terminated',
            'progress_percentage' => 'sometimes|integer|min:0|max:100',
        ];
    }
}
