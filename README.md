# HAHAHUB – Navodila za deployment

## KORAK 1: Supabase baza

1. Pojdi na supabase.com → tvoj projekt hahahub
2. Levo klikni **SQL Editor**
3. Odpri datoteko `SUPABASE_SETUP.sql` iz tega projekta
4. Kopiraj VSO vsebino in jo prilepi v SQL Editor
5. Klikni **Run**
6. Moraš videti: "Success. No rows returned"

## KORAK 2: GitHub repo

1. Pojdi na github.com → klikni **+** → **New repository**
2. Ime: `hahahub`
3. Private ali Public (tvoja izbira)
4. Klikni **Create repository**
5. Sledi navodilom za "push existing repository"

## KORAK 3: Vercel (hosting)

1. Pojdi na vercel.com
2. Klikni **Sign up with GitHub**
3. Klikni **Add New Project**
4. Izberi tvoj `hahahub` repo
5. Klikni **Deploy**
6. Stran bo živa v ~2 minutah!

## ADMIN DOSTOP

- Prijavi se z: bacinhos@gmail.com
- Admin panel je avtomatsko dostopen tvojemu emailu

## STRIPE PLAČILA (za pravo plačilo)

Ko boš pripravljen za pravo plačevanje:
1. Aktiviraj Stripe račun (izpolni podatke)
2. Ustvari "Price" v Stripe za €79/leto
3. Dodaj Stripe Checkout integracija

---
Zgrajeno z: React + TypeScript + Supabase + Vite
