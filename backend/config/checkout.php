<?php

return [
    // Development-only zero-fee COD. Production stays closed until explicitly configured.
    'enabled' => (bool) env('CHECKOUT_ENABLED', in_array(env('APP_ENV'), ['local', 'testing'], true)),
    'currency' => 'PKR',
    'shipping_minor' => (int) env('CHECKOUT_SHIPPING_MINOR', 0),
    'tax_basis_points' => (int) env('CHECKOUT_TAX_BASIS_POINTS', 0),
    'quote_minutes' => 10,
];
