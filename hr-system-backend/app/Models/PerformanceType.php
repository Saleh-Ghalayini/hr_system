<?php

namespace App\Models;
use App\Models\TeamPerformance;
use Illuminate\Database\Eloquent\Model;

class PerformanceType extends Model
{
    protected $fillable = [
        'name',

    ];
    public function teamPerformance(){
        $this->hasMany(TeamPerformance::class);
    }

}
