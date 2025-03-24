<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InsuranceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void{
        
        DB::table('insurances')->insert([
            ['type'=>'HAF',
            'cost'=>50,],
            ['type'=>'GNA',
            'cost'=>70,],
            ['type'=>'RLDA',
            'cost'=>100,]
        ]);
    }
}
