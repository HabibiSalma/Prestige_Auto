<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DatabaseSeeder — populates the database with realistic demo data so
 * the platform is usable the moment the migrations finish.
 *
 * Creates:
 *   - 3 agencies in Morocco (Casablanca, Marrakech, Rabat),
 *   - 1 proprietaire, 2 gestionnaires (one per agency), 3 clients,
 *   - 12 vehicles spread across the agencies,
 *   - placeholder image rows pointing to /assets/cars/* so the front-end
 *     renders something out of the box even before the student uploads
 *     their own sports-car photos.
 *   - a few reservations in different statuses.
 *
 * Run with:  php artisan migrate:fresh --seed
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Insert all demo records.
     */
    public function run(): void
    {
        // -----------------------------------------------------------------
        // 1) AGENCIES
        // -----------------------------------------------------------------
        $casa = Agency::create([
            'name'        => 'Prestige Auto Casablanca',
            'city'        => 'Casablanca',
            'address'     => 'Boulevard de la Corniche, Anfa',
            'latitude'    => 33.5731,
            'longitude'   => -7.6298,
            'phone'       => '+212 522 11 22 33',
            'email'       => 'casa@prestige-auto.ma',
            'description' => 'Notre flagship sur la Corniche. Spécialité : véhicules sportifs et luxe.',
        ]);

        $marrakech = Agency::create([
            'name'        => 'Prestige Auto Marrakech',
            'city'        => 'Marrakech',
            'address'     => 'Avenue Mohammed VI, Gueliz',
            'latitude'    => 31.6295,
            'longitude'   => -7.9811,
            'phone'       => '+212 524 44 55 66',
            'email'       => 'marrakech@prestige-auto.ma',
            'description' => 'Au cœur de la ville ocre, à 5 min de l\'aéroport Menara.',
        ]);

        $rabat = Agency::create([
            'name'        => 'Prestige Auto Rabat',
            'city'        => 'Rabat',
            'address'     => 'Hay Riad, Avenue Annakhil',
            'latitude'    => 33.9716,
            'longitude'   => -6.8498,
            'phone'       => '+212 537 77 88 99',
            'email'       => 'rabat@prestige-auto.ma',
            'description' => 'Agence quartier Hay Riad — berlines exécutives et SUV.',
        ]);

        // -----------------------------------------------------------------
        // 2) USERS
        // -----------------------------------------------------------------
        $owner = User::create([
            'name'     => 'Hicham Bennani',
            'email'    => 'owner@prestige-auto.ma',
            'phone'    => '+212 600 00 00 01',
            'password' => Hash::make('password'),
            'role'     => 'proprietaire',
            'city'     => 'Casablanca',
        ]);

        User::create([
            'name'      => 'Salma Idrissi',
            'email'     => 'gestionnaire.casa@prestige-auto.ma',
            'phone'     => '+212 600 00 00 02',
            'password'  => Hash::make('password'),
            'role'      => 'gestionnaire',
            'agency_id' => $casa->id,
            'city'      => 'Casablanca',
        ]);

        User::create([
            'name'      => 'Omar Tazi',
            'email'     => 'gestionnaire.marrakech@prestige-auto.ma',
            'phone'     => '+212 600 00 00 03',
            'password'  => Hash::make('password'),
            'role'      => 'gestionnaire',
            'agency_id' => $marrakech->id,
            'city'      => 'Marrakech',
        ]);

        $client1 = User::create([
            'name'           => 'Yassine El Amrani',
            'email'          => 'client@prestige-auto.ma',
            'phone'          => '+212 611 22 33 44',
            'password'       => Hash::make('password'),
            'role'           => 'client',
            'city'           => 'Casablanca',
            'address'        => '12 rue des Roses, Maarif',
            'licence_number' => 'A123456',
        ]);

        $client2 = User::create([
            'name'     => 'Sara Lahlou',
            'email'    => 'sara@example.com',
            'phone'    => '+212 612 34 56 78',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'city'     => 'Rabat',
        ]);

        User::create([
            'name'     => 'Mehdi Benjelloun',
            'email'    => 'mehdi@example.com',
            'phone'    => '+212 613 45 67 89',
            'password' => Hash::make('password'),
            'role'     => 'client',
            'city'     => 'Marrakech',
        ]);

        // -----------------------------------------------------------------
        // 3) VEHICLES + IMAGES (placeholders the student can replace later)
        // -----------------------------------------------------------------
        // We use Unsplash-style placeholder URLs so the catalogue is not empty
        // out-of-the-box. Replace them with real photos when ready.
        $fleet = [
            // Casablanca
            ['Porsche', '911 Carrera', 2024, 'sportive', 'essence', 2, 2200, true,  4.9, $casa],
            ['Ferrari', '488 GTB',     2023, 'sportive', 'essence', 2, 4500, true,  5.0, $casa],
            ['Lamborghini', 'Huracan', 2023, 'sportive', 'essence', 2, 4800, true,  4.9, $casa],
            ['Mercedes-Benz', 'S-Class', 2024, 'luxe',  'hybride', 5, 1900, true,  4.8, $casa],
            ['BMW', 'M4 Competition',  2024, 'sportive', 'essence', 4, 1800, true,  4.7, $casa],

            // Marrakech
            ['Range Rover', 'Sport',   2024, 'suv',     'diesel',  5, 1700, true,  4.8, $marrakech],
            ['Tesla', 'Model S',       2023, 'electrique', 'electrique', 5, 1400, true, 4.7, $marrakech],
            ['Mustang', 'GT 5.0',      2023, 'sportive', 'essence', 4, 1600, false, 4.6, $marrakech],
            ['Audi', 'RS6 Avant',      2023, 'berline',  'essence', 5, 2000, true,  4.8, $marrakech],

            // Rabat
            ['BMW', 'X5',              2024, 'suv',      'diesel',  5, 1500, false, 4.5, $rabat],
            ['Mercedes-Benz', 'E-Class', 2024, 'berline','diesel',  5, 1100, false, 4.6, $rabat],
            ['Audi', 'A4',             2023, 'berline',  'diesel',  5, 800,  false, 4.4, $rabat],
        ];

        // Generic placeholders. The is_main = true row will be used on the
        // catalogue cards.
        $placeholderImage = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1280&q=80';

        foreach ($fleet as $row) {
            [$brand, $model, $year, $category, $fuel, $seats, $price, $premium, $rating, $agency] = $row;

            $vehicle = Vehicle::create([
                'agency_id'     => $agency->id,
                'brand'         => $brand,
                'model'         => $model,
                'year'          => $year,
                'category'      => $category,
                'fuel_type'     => $fuel,
                'seats'         => $seats,
                'price_per_day' => $price,
                'status'        => 'disponible',
                'description'   => "Découvrez la {$brand} {$model} {$year} — un véhicule d'exception entretenu par nos équipes Prestige Auto.",
                'is_premium'    => $premium,
                'rating'        => $rating,
            ]);

            // 1 main image + 2 thumbnails (all placeholders).
            VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'image_path' => $placeholderImage,
                'is_main'    => true,
                'sort_order' => 0,
            ]);
            VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'image_path' => 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1280&q=80',
                'is_main'    => false,
                'sort_order' => 1,
            ]);
            VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'image_path' => 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1280&q=80',
                'is_main'    => false,
                'sort_order' => 2,
            ]);
        }

        // -----------------------------------------------------------------
        // 4) DEMO RESERVATIONS
        // -----------------------------------------------------------------
        $porsche = Vehicle::where('model', '911 Carrera')->first();
        $tesla   = Vehicle::where('model', 'Model S')->first();
        $bmwX5   = Vehicle::where('model', 'X5')->first();

        Reservation::create([
            'user_id'     => $client1->id,
            'vehicle_id'  => $porsche->id,
            'agency_id'   => $porsche->agency_id,
            'start_date'  => now()->addDays(5)->toDateString(),
            'end_date'    => now()->addDays(8)->toDateString(),
            'pickup_time' => '10:00',
            'return_time' => '18:00',
            'total_price' => $porsche->price_per_day * 4,
            'status'      => 'pending',
        ]);

        Reservation::create([
            'user_id'     => $client1->id,
            'vehicle_id'  => $tesla->id,
            'agency_id'   => $tesla->agency_id,
            'start_date'  => now()->subDays(15)->toDateString(),
            'end_date'    => now()->subDays(12)->toDateString(),
            'pickup_time' => '09:00',
            'return_time' => '20:00',
            'total_price' => $tesla->price_per_day * 4,
            'status'      => 'completed',
        ]);

        Reservation::create([
            'user_id'     => $client2->id,
            'vehicle_id'  => $bmwX5->id,
            'agency_id'   => $bmwX5->agency_id,
            'start_date'  => now()->addDays(2)->toDateString(),
            'end_date'    => now()->addDays(4)->toDateString(),
            'pickup_time' => '11:00',
            'return_time' => '17:00',
            'total_price' => $bmwX5->price_per_day * 3,
            'status'      => 'confirmed',
        ]);
    }
}
