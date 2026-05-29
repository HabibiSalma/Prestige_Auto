<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * Base controller — every other controller extends this one. It gives
 * us the AuthorizesRequests and ValidatesRequests traits, used by all
 * controllers for policy checks and inline validation.
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
