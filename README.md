# omni mun — norcal independent delegation

website for omni mun, a student-run independent model un delegation based in northern california.

## stack

- **frontend** — vanilla html/css/js, no frameworks
- **auth + database** — [supabase](https://supabase.com) (email/password + google oauth)
- **hosting** — github pages
- **fonts** — comfortaa (google fonts)

## structure

```
omni-mun/
├── index.html          # main entry point
├── css/
│   └── style.css       # all styles
├── js/
│   ├── app.js          # supabase client, auth state, ui logic
│   └── register.js     # conference registration form logic
├── assets/
│   └── logo.png        # omni mun logo
└── README.md
```

## local dev

just open `index.html` in a browser — no build step needed.

## supabase schema

```sql
-- profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  grade text,
  school text,
  phone text,
  created_at timestamp default now()
);

-- registrations table
create table registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  conference text,
  name text, email text, phone text, grade text, school text,
  instagram text,
  mun_experience_years text,
  committee_preference text,
  notes text,
  guardian_advisor text,
  guardian_name text, guardian_email text, guardian_phone text,
  hotel_preference text,
  roommate_preference text,
  description text,
  created_at timestamp default now()
);
```

## contact

instagram: [@omni.mun](https://instagram.com/omni.mun)  
email: omni.model.un@gmail.com
