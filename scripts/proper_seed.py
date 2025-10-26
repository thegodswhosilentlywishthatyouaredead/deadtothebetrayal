#!/usr/bin/env python3
"""
Proper seed data script for AIFF database
"""
import os
from sqlalchemy import create_engine, text
import random
from datetime import datetime, timedelta

# Database setup
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

def seed_database():
    """Seed the database with sample data"""
    print("🌱 Seeding database with sample data...")
    
    with engine.connect() as conn:
        # Insert sample users
        print("👥 Creating sample users...")
        users_data = [
            ("admin", "admin@aiff.com", "Admin User"),
            ("john_doe", "john@aiff.com", "John Doe"),
            ("jane_smith", "jane@aiff.com", "Jane Smith"),
            ("mike_wilson", "mike@aiff.com", "Mike Wilson"),
            ("sarah_jones", "sarah@aiff.com", "Sarah Jones"),
        ]
        
        for username, email, full_name in users_data:
            conn.execute(text("""
                INSERT INTO users (username, email, full_name, is_active)
                VALUES (:username, :email, :full_name, :is_active)
                ON CONFLICT (username) DO NOTHING
            """), {
                "username": username,
                "email": email,
                "full_name": full_name,
                "is_active": True
            })
        
        # Insert 150 sample teams with Malaysian cabinet members
        print("🏢 Creating 150 sample teams with Malaysian cabinet members...")
        
        # Malaysian cabinet members and additional Malaysian names
        malaysian_cabinet = [
            {"name": "Anwar Ibrahim", "state": "Kuala Lumpur", "district": "Kuala Lumpur"},
            {"name": "Ahmad Zahid Hamidi", "state": "Perak", "district": "Bagan Datuk"},
            {"name": "Fadillah Yusof", "state": "Sarawak", "district": "Petra Jaya"},
            {"name": "Mohamed Azmin Ali", "state": "Selangor", "district": "Gombak"},
            {"name": "Rafizi Ramli", "state": "Selangor", "district": "Pandan"},
            {"name": "Nga Kor Ming", "state": "Perak", "district": "Teluk Intan"},
            {"name": "Zulkifli Aziz", "state": "Kedah", "district": "Kubang Pasu"},
            {"name": "Steven Sim", "state": "Penang", "district": "Bukit Mertajam"},
            {"name": "Shahidan Kassim", "state": "Perlis", "district": "Arau"},
            {"name": "Saarani Mohamad", "state": "Perak", "district": "Kinta"},
            {"name": "Muhammad Sanusi", "state": "Kedah", "district": "Jerlun"},
            {"name": "Wan Saiful Wan Jan", "state": "Kedah", "district": "Tumpat"},
            {"name": "Ahmad Faizal Azumu", "state": "Perak", "district": "Tambun"},
            {"name": "Ismail Sabri Yaakob", "state": "Pahang", "district": "Bera"},
            {"name": "Hishammuddin Hussein", "state": "Johor", "district": "Sembrong"},
            {"name": "Khairy Jamaluddin", "state": "Selangor", "district": "Rembau"},
            {"name": "Muhyiddin Yassin", "state": "Johor", "district": "Pagoh"},
            {"name": "Azalina Othman", "state": "Johor", "district": "Pengerang"},
            {"name": "Tengku Zafrul Aziz", "state": "Selangor", "district": "Kuala Selangor"},
            {"name": "Wan Junaidi Tuanku Jaafar", "state": "Sarawak", "district": "Santubong"},
            {"name": "Rosmah Mansor", "state": "Selangor", "district": "Kuala Selangor"},
            {"name": "Najib Razak", "state": "Pahang", "district": "Pekan"},
            {"name": "Mahathir Mohamad", "state": "Kedah", "district": "Kubang Pasu"},
            {"name": "Lim Guan Eng", "state": "Penang", "district": "Bagan"},
            {"name": "Gobind Singh Deo", "state": "Selangor", "district": "Puchong"},
            {"name": "Teresa Kok", "state": "Selangor", "district": "Seputeh"},
            {"name": "Tony Pua", "state": "Selangor", "district": "Petaling Jaya"},
            {"name": "Hannah Yeoh", "state": "Selangor", "district": "Segambut"},
            {"name": "Charles Santiago", "state": "Selangor", "district": "Klang"},
            {"name": "Wong Chen", "state": "Selangor", "district": "Kelana Jaya"},
            # Additional Malaysian names
            {"name": "Ansahari Ahmad", "state": "Selangor", "district": "Shah Alam"},
            {"name": "Khairi Jamal", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Izzah", "state": "Kuala Lumpur", "district": "Lembah Pantai"},
            {"name": "Azrai Zainal", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Deva Raj", "state": "Penang", "district": "George Town"},
            {"name": "Siti Nurhaliza", "state": "Selangor", "district": "Kajang"},
            {"name": "Ahmad Fauzi", "state": "Perak", "district": "Ipoh"},
            {"name": "Rashidah Ismail", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Hafiz Hamid", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Norazlina Ahmad", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Zainal Abidin", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Fatimah Zahra", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Syafiq", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Huda", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Razlan", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Aishah", "state": "Putrajaya", "district": "Putrajaya"},
            {"name": "Ahmad Firdaus", "state": "Selangor", "district": "Subang Jaya"},
            {"name": "Nurul Ain", "state": "Johor", "district": "Muar"},
            {"name": "Mohd Hafiz", "state": "Kedah", "district": "Sungai Petani"},
            {"name": "Siti Sarah", "state": "Penang", "district": "Butterworth"},
            {"name": "Ahmad Zaki", "state": "Perak", "district": "Taiping"},
            {"name": "Nurul Iman", "state": "Kelantan", "district": "Pasir Mas"},
            {"name": "Mohd Firdaus", "state": "Terengganu", "district": "Kemaman"},
            {"name": "Siti Aisyah", "state": "Negeri Sembilan", "district": "Port Dickson"},
            {"name": "Ahmad Farhan", "state": "Melaka", "district": "Alor Gajah"},
            {"name": "Nurul Syafiqah", "state": "Sabah", "district": "Sandakan"},
            {"name": "Mohd Syafiq", "state": "Sarawak", "district": "Miri"},
            {"name": "Siti Nurul", "state": "Pahang", "district": "Temerloh"},
            {"name": "Ahmad Fauzi", "state": "Perlis", "district": "Arau"},
            {"name": "Nurul Huda", "state": "Putrajaya", "district": "Presint 1"},
            {"name": "Mohd Azlan", "state": "Selangor", "district": "Petaling Jaya"},
            {"name": "Siti Aminah", "state": "Johor", "district": "Batu Pahat"},
            {"name": "Ahmad Firdaus", "state": "Kedah", "district": "Kulim"},
            {"name": "Nurul Izzah", "state": "Penang", "district": "Nibong Tebal"},
            {"name": "Mohd Hafiz", "state": "Perak", "district": "Kampar"},
            {"name": "Siti Sarah", "state": "Kelantan", "district": "Tumpat"},
            {"name": "Ahmad Zaki", "state": "Terengganu", "district": "Besut"},
            {"name": "Nurul Iman", "state": "Negeri Sembilan", "district": "Jelebu"},
            {"name": "Mohd Firdaus", "state": "Melaka", "district": "Jasin"},
            {"name": "Siti Aisyah", "state": "Sabah", "district": "Tawau"},
            {"name": "Ahmad Farhan", "state": "Sarawak", "district": "Sibu"},
            {"name": "Nurul Syafiqah", "state": "Pahang", "district": "Bentong"},
            {"name": "Mohd Syafiq", "state": "Perlis", "district": "Padang Besar"},
            {"name": "Siti Nurul", "state": "Putrajaya", "district": "Presint 2"},
            {"name": "Ahmad Fauzi", "state": "Selangor", "district": "Klang"},
            {"name": "Nurul Huda", "state": "Johor", "district": "Kluang"},
            {"name": "Mohd Azlan", "state": "Kedah", "district": "Baling"},
            {"name": "Siti Aminah", "state": "Penang", "district": "Balik Pulau"},
            {"name": "Ahmad Firdaus", "state": "Perak", "district": "Lumut"},
            {"name": "Nurul Izzah", "state": "Kelantan", "district": "Machang"},
            {"name": "Mohd Hafiz", "state": "Terengganu", "district": "Hulu Terengganu"},
            {"name": "Siti Sarah", "state": "Negeri Sembilan", "district": "Rembau"},
            {"name": "Ahmad Zaki", "state": "Melaka", "district": "Jasin"},
            {"name": "Nurul Iman", "state": "Sabah", "district": "Lahad Datu"},
            {"name": "Mohd Firdaus", "state": "Sarawak", "district": "Limbang"},
            {"name": "Siti Aisyah", "state": "Pahang", "district": "Raub"},
            {"name": "Ahmad Farhan", "state": "Perlis", "district": "Padang Besar"},
            {"name": "Nurul Syafiqah", "state": "Putrajaya", "district": "Presint 3"},
            {"name": "Mohd Syafiq", "state": "Selangor", "district": "Ampang"},
            {"name": "Siti Nurul", "state": "Johor", "district": "Pontian"},
            {"name": "Ahmad Fauzi", "state": "Kedah", "district": "Pokok Sena"},
            {"name": "Nurul Huda", "state": "Penang", "district": "Seberang Perai"},
            {"name": "Mohd Azlan", "state": "Perak", "district": "Larut Matang"},
            {"name": "Siti Aminah", "state": "Kelantan", "district": "Pasir Puteh"},
            {"name": "Ahmad Firdaus", "state": "Terengganu", "district": "Setiu"},
            {"name": "Nurul Izzah", "state": "Negeri Sembilan", "district": "Tampin"},
            {"name": "Mohd Hafiz", "state": "Melaka", "district": "Masjid Tanah"},
            {"name": "Siti Sarah", "state": "Sabah", "district": "Keningau"},
            {"name": "Ahmad Zaki", "state": "Sarawak", "district": "Mukah"},
            {"name": "Nurul Iman", "state": "Pahang", "district": "Lipis"},
            {"name": "Mohd Firdaus", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Aisyah", "state": "Putrajaya", "district": "Presint 4"},
            {"name": "Ahmad Farhan", "state": "Selangor", "district": "Gombak"},
            {"name": "Nurul Syafiqah", "state": "Johor", "district": "Segamat"},
            {"name": "Mohd Syafiq", "state": "Kedah", "district": "Yan"},
            {"name": "Siti Nurul", "state": "Penang", "district": "Timur Laut"},
            {"name": "Ahmad Fauzi", "state": "Perak", "district": "Kinta"},
            {"name": "Nurul Huda", "state": "Kelantan", "district": "Gua Musang"},
            {"name": "Mohd Azlan", "state": "Terengganu", "district": "Kemaman"},
            {"name": "Siti Aminah", "state": "Negeri Sembilan", "district": "Jelebu"},
            {"name": "Ahmad Firdaus", "state": "Melaka", "district": "Alor Gajah"},
            {"name": "Nurul Izzah", "state": "Sabah", "district": "Papar"},
            {"name": "Mohd Hafiz", "state": "Sarawak", "district": "Betong"},
            {"name": "Siti Sarah", "state": "Pahang", "district": "Maran"},
            {"name": "Ahmad Zaki", "state": "Perlis", "district": "Padang Besar"},
            {"name": "Nurul Iman", "state": "Putrajaya", "district": "Presint 5"},
            {"name": "Mohd Firdaus", "state": "Selangor", "district": "Hulu Selangor"},
            {"name": "Siti Aisyah", "state": "Johor", "district": "Kota Tinggi"},
            {"name": "Ahmad Farhan", "state": "Kedah", "district": "Sik"},
            {"name": "Nurul Syafiqah", "state": "Penang", "district": "Barat Daya"},
            {"name": "Mohd Syafiq", "state": "Perak", "district": "Hilir Perak"},
            {"name": "Siti Nurul", "state": "Kelantan", "district": "Jeli"},
            {"name": "Ahmad Fauzi", "state": "Terengganu", "district": "Marang"},
            {"name": "Nurul Huda", "state": "Negeri Sembilan", "district": "Kuala Pilah"},
            {"name": "Mohd Azlan", "state": "Melaka", "district": "Merlimau"},
            {"name": "Siti Aminah", "state": "Sabah", "district": "Beaufort"},
            {"name": "Ahmad Firdaus", "state": "Sarawak", "district": "Kapit"},
            {"name": "Nurul Izzah", "state": "Pahang", "district": "Jerantut"},
            {"name": "Mohd Hafiz", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Sarah", "state": "Putrajaya", "district": "Presint 6"},
            {"name": "Ahmad Zaki", "state": "Selangor", "district": "Hulu Langat"},
            {"name": "Nurul Iman", "state": "Johor", "district": "Mersing"},
            {"name": "Mohd Firdaus", "state": "Kedah", "district": "Baling"},
            {"name": "Siti Aisyah", "state": "Penang", "district": "Seberang Perai Utara"},
            {"name": "Ahmad Farhan", "state": "Perak", "district": "Manjung"},
            {"name": "Nurul Syafiqah", "state": "Kelantan", "district": "Tanah Merah"},
            {"name": "Mohd Syafiq", "state": "Terengganu", "district": "Dungun"},
            {"name": "Siti Nurul", "state": "Negeri Sembilan", "district": "Jempol"},
            {"name": "Ahmad Fauzi", "state": "Melaka", "district": "Tangga Batu"},
            {"name": "Nurul Huda", "state": "Sabah", "district": "Kudat"},
            {"name": "Mohd Azlan", "state": "Sarawak", "district": "Limbang"},
            {"name": "Siti Aminah", "state": "Pahang", "district": "Cameron Highlands"},
            {"name": "Ahmad Firdaus", "state": "Perlis", "district": "Padang Besar"},
            {"name": "Nurul Izzah", "state": "Putrajaya", "district": "Presint 7"},
            {"name": "Mohd Hafiz", "state": "Selangor", "district": "Kuala Selangor"},
            {"name": "Siti Sarah", "state": "Johor", "district": "Kulai"},
            {"name": "Ahmad Zaki", "state": "Kedah", "district": "Kubang Pasu"},
            {"name": "Nurul Iman", "state": "Penang", "district": "Seberang Perai Selatan"},
            {"name": "Mohd Firdaus", "state": "Perak", "district": "Perak Tengah"},
            {"name": "Siti Aisyah", "state": "Kelantan", "district": "Bachok"},
            {"name": "Ahmad Farhan", "state": "Terengganu", "district": "Kuala Nerus"},
            {"name": "Nurul Syafiqah", "state": "Negeri Sembilan", "district": "Port Dickson"},
            {"name": "Mohd Syafiq", "state": "Melaka", "district": "Hang Tuah Jaya"},
            {"name": "Siti Nurul", "state": "Sabah", "district": "Ranau"},
            {"name": "Ahmad Fauzi", "state": "Sarawak", "district": "Sri Aman"},
            {"name": "Nurul Huda", "state": "Pahang", "district": "Bera"},
            {"name": "Mohd Azlan", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Aminah", "state": "Putrajaya", "district": "Presint 8"},
            {"name": "Ahmad Firdaus", "state": "Selangor", "district": "Sepang"},
            {"name": "Nurul Izzah", "state": "Johor", "district": "Kulai"},
            {"name": "Mohd Hafiz", "state": "Kedah", "district": "Pokok Sena"},
            {"name": "Siti Sarah", "state": "Penang", "district": "Barat Daya"},
            {"name": "Ahmad Zaki", "state": "Perak", "district": "Kinta"},
            {"name": "Nurul Iman", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Mohd Firdaus", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Siti Aisyah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Ahmad Farhan", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Nurul Syafiqah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Mohd Syafiq", "state": "Sarawak", "district": "Kuching"},
            {"name": "Siti Nurul", "state": "Pahang", "district": "Kuantan"},
            {"name": "Ahmad Fauzi", "state": "Perlis", "district": "Kangar"},
            {"name": "Nurul Huda", "state": "Putrajaya", "district": "Presint 9"},
            {"name": "Mohd Azlan", "state": "Selangor", "district": "Petaling"},
            {"name": "Siti Aminah", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Ahmad Firdaus", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Izzah", "state": "Penang", "district": "George Town"},
            {"name": "Mohd Hafiz", "state": "Perak", "district": "Ipoh"},
            {"name": "Siti Sarah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Ahmad Zaki", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Nurul Iman", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Mohd Firdaus", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Siti Aisyah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Farhan", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Syafiqah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Syafiq", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Nurul", "state": "Putrajaya", "district": "Presint 10"},
            {"name": "Ahmad Fauzi", "state": "Selangor", "district": "Klang"},
            {"name": "Nurul Huda", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Mohd Azlan", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Siti Aminah", "state": "Penang", "district": "George Town"},
            {"name": "Ahmad Firdaus", "state": "Perak", "district": "Ipoh"},
            {"name": "Nurul Izzah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Mohd Hafiz", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Siti Sarah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Ahmad Zaki", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Nurul Iman", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Mohd Firdaus", "state": "Sarawak", "district": "Kuching"},
            {"name": "Siti Aisyah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Ahmad Farhan", "state": "Perlis", "district": "Kangar"},
            {"name": "Nurul Syafiqah", "state": "Putrajaya", "district": "Presint 11"},
            {"name": "Mohd Syafiq", "state": "Selangor", "district": "Klang"},
            {"name": "Siti Nurul", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Ahmad Fauzi", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Huda", "state": "Penang", "district": "George Town"},
            {"name": "Mohd Azlan", "state": "Perak", "district": "Ipoh"},
            {"name": "Siti Aminah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Ahmad Firdaus", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Nurul Izzah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Mohd Hafiz", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Siti Sarah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Zaki", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Iman", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Firdaus", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Aisyah", "state": "Putrajaya", "district": "Presint 12"},
            {"name": "Ahmad Farhan", "state": "Selangor", "district": "Klang"},
            {"name": "Nurul Syafiqah", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Mohd Syafiq", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Siti Nurul", "state": "Penang", "district": "George Town"},
            {"name": "Ahmad Fauzi", "state": "Perak", "district": "Ipoh"},
            {"name": "Nurul Huda", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Mohd Azlan", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Siti Aminah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Ahmad Firdaus", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Nurul Izzah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Mohd Hafiz", "state": "Sarawak", "district": "Kuching"},
            {"name": "Siti Sarah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Ahmad Zaki", "state": "Perlis", "district": "Kangar"},
            {"name": "Nurul Iman", "state": "Putrajaya", "district": "Presint 13"},
            {"name": "Mohd Firdaus", "state": "Selangor", "district": "Klang"},
            {"name": "Siti Aisyah", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Ahmad Farhan", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Syafiqah", "state": "Penang", "district": "George Town"},
            {"name": "Mohd Syafiq", "state": "Perak", "district": "Ipoh"},
            {"name": "Siti Nurul", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Ahmad Fauzi", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Nurul Huda", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Mohd Azlan", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Siti Aminah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Firdaus", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Izzah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Hafiz", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Sarah", "state": "Putrajaya", "district": "Presint 14"},
            {"name": "Ahmad Zaki", "state": "Selangor", "district": "Klang"},
            {"name": "Nurul Iman", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Mohd Firdaus", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Siti Aisyah", "state": "Penang", "district": "George Town"},
            {"name": "Ahmad Farhan", "state": "Perak", "district": "Ipoh"},
            {"name": "Nurul Syafiqah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Mohd Syafiq", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Siti Nurul", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Ahmad Fauzi", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Nurul Huda", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Mohd Azlan", "state": "Sarawak", "district": "Kuching"},
            {"name": "Siti Aminah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Ahmad Firdaus", "state": "Perlis", "district": "Kangar"},
            {"name": "Nurul Izzah", "state": "Putrajaya", "district": "Presint 15"},
            {"name": "Mohd Hafiz", "state": "Selangor", "district": "Klang"},
            {"name": "Siti Sarah", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Ahmad Zaki", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Iman", "state": "Penang", "district": "George Town"},
            {"name": "Mohd Firdaus", "state": "Perak", "district": "Ipoh"},
            {"name": "Siti Aisyah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Ahmad Farhan", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Nurul Syafiqah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Mohd Syafiq", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Siti Nurul", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Fauzi", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Huda", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Azlan", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Aminah", "state": "Putrajaya", "district": "Presint 16"},
            {"name": "Ahmad Firdaus", "state": "Selangor", "district": "Klang"},
            {"name": "Nurul Izzah", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Mohd Hafiz", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Siti Sarah", "state": "Penang", "district": "George Town"},
            {"name": "Ahmad Zaki", "state": "Perak", "district": "Ipoh"},
            {"name": "Nurul Iman", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Mohd Firdaus", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Siti Aisyah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Ahmad Farhan", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Nurul Syafiqah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Mohd Syafiq", "state": "Sarawak", "district": "Kuching"},
            {"name": "Siti Nurul", "state": "Pahang", "district": "Kuantan"},
            {"name": "Ahmad Fauzi", "state": "Perlis", "district": "Kangar"},
            {"name": "Nurul Huda", "state": "Putrajaya", "district": "Presint 17"},
            {"name": "Mohd Azlan", "state": "Selangor", "district": "Klang"},
            {"name": "Siti Aminah", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Ahmad Firdaus", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Izzah", "state": "Penang", "district": "George Town"},
            {"name": "Mohd Hafiz", "state": "Perak", "district": "Ipoh"},
            {"name": "Siti Sarah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Ahmad Zaki", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Nurul Iman", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Mohd Firdaus", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Siti Aisyah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Farhan", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Syafiqah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Syafiq", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Nurul", "state": "Putrajaya", "district": "Presint 18"},
            {"name": "Ahmad Fauzi", "state": "Selangor", "district": "Klang"},
            {"name": "Nurul Huda", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Mohd Azlan", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Siti Aminah", "state": "Penang", "district": "George Town"},
            {"name": "Ahmad Firdaus", "state": "Perak", "district": "Ipoh"},
            {"name": "Nurul Izzah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Mohd Hafiz", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Siti Sarah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Ahmad Zaki", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Nurul Iman", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Mohd Firdaus", "state": "Sarawak", "district": "Kuching"},
            {"name": "Siti Aisyah", "state": "Pahang", "district": "Kuantan"},
            {"name": "Ahmad Farhan", "state": "Perlis", "district": "Kangar"},
            {"name": "Nurul Syafiqah", "state": "Putrajaya", "district": "Presint 19"},
            {"name": "Mohd Syafiq", "state": "Selangor", "district": "Klang"},
            {"name": "Siti Nurul", "state": "Johor", "district": "Johor Bahru"},
            {"name": "Ahmad Fauzi", "state": "Kedah", "district": "Alor Setar"},
            {"name": "Nurul Huda", "state": "Penang", "district": "George Town"},
            {"name": "Mohd Azlan", "state": "Perak", "district": "Ipoh"},
            {"name": "Siti Aminah", "state": "Kelantan", "district": "Kota Bharu"},
            {"name": "Ahmad Firdaus", "state": "Terengganu", "district": "Kuala Terengganu"},
            {"name": "Nurul Izzah", "state": "Negeri Sembilan", "district": "Seremban"},
            {"name": "Mohd Hafiz", "state": "Melaka", "district": "Melaka Tengah"},
            {"name": "Siti Sarah", "state": "Sabah", "district": "Kota Kinabalu"},
            {"name": "Ahmad Zaki", "state": "Sarawak", "district": "Kuching"},
            {"name": "Nurul Iman", "state": "Pahang", "district": "Kuantan"},
            {"name": "Mohd Firdaus", "state": "Perlis", "district": "Kangar"},
            {"name": "Siti Aisyah", "state": "Putrajaya", "district": "Presint 20"}
        ]
        
        teams_data = []
        for i in range(1, 151):
            cabinet_member = malaysian_cabinet[(i - 1) % len(malaysian_cabinet)]
            teams_data.append((cabinet_member["name"], cabinet_member["state"]))

        for name, zone in teams_data:
            try:
                result = conn.execute(text("""
                    INSERT INTO teams (name, zone, is_active)
                    VALUES (:name, :zone, :is_active)
                    ON CONFLICT (name) DO NOTHING
                """), {"name": name, "zone": zone, "is_active": True})
                print(f"Inserted team: {name} in {zone}")
            except Exception as e:
                print(f"Error inserting team {name}: {e}")
                raise
        
        # Commit teams before inserting tickets
        conn.commit()
        print("✅ Teams committed to database")
        
        # Insert 1000 sample tickets with realistic telco network causals
        print("🎫 Creating 1000 sample tickets...")
        
        # Telco network issue causals with codes
        telco_causals = [
            {
                "code": "DF001",
                "title": "Drop Fiber Cut",
                "description": "Customer drop fiber cable severed due to construction work or accidental damage",
                "category": "REPAIR",
                "priority": "HIGH"
            },
            {
                "code": "CPE002", 
                "title": "Customer CPE Failure",
                "description": "Customer Premises Equipment (router/modem) hardware malfunction or configuration issue",
                "category": "REPAIR",
                "priority": "MEDIUM"
            },
            {
                "code": "LS003",
                "title": "Long Span Cable Damage",
                "description": "Long span fiber cable damaged by weather, rodents, or environmental factors",
                "category": "REPAIR", 
                "priority": "HIGH"
            },
            {
                "code": "RD004",
                "title": "Rodent Damage",
                "description": "Fiber cable chewed by rodents causing service interruption",
                "category": "REPAIR",
                "priority": "MEDIUM"
            },
            {
                "code": "FD005",
                "title": "Fiber Distribution Point Failure",
                "description": "FDP cabinet or splitter equipment malfunction affecting multiple customers",
                "category": "REPAIR",
                "priority": "URGENT"
            },
            {
                "code": "SP006",
                "title": "Splice Point Degradation",
                "description": "Fiber splice point degraded due to moisture ingress or poor installation",
                "category": "REPAIR",
                "priority": "MEDIUM"
            },
            {
                "code": "MT007",
                "title": "Manhole Theft",
                "description": "Fiber cables stolen from manhole or underground infrastructure",
                "category": "REPAIR",
                "priority": "HIGH"
            },
            {
                "code": "PW008",
                "title": "Power Supply Failure",
                "description": "Network equipment power supply failure causing service outage",
                "category": "REPAIR",
                "priority": "URGENT"
            },
            {
                "code": "FI009",
                "title": "Fiber Installation New Customer",
                "description": "New fiber installation for residential or business customer",
                "category": "FIBER_INSTALLATION",
                "priority": "MEDIUM"
            },
            {
                "code": "PM010",
                "title": "Preventive Maintenance",
                "description": "Scheduled preventive maintenance of network infrastructure",
                "category": "MAINTENANCE",
                "priority": "LOW"
            },
            {
                "code": "IN011",
                "title": "Network Inspection",
                "description": "Routine inspection of network infrastructure and equipment",
                "category": "INSPECTION",
                "priority": "LOW"
            },
            {
                "code": "OV012",
                "title": "Overhead Cable Damage",
                "description": "Overhead fiber cable damaged by tree branches or vehicle collision",
                "category": "REPAIR",
                "priority": "HIGH"
            }
        ]
        
        ticket_statuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

        now = datetime.utcnow()
        for i in range(1, 1001):
            ticket_number = f"CTT_{i:03d}"
            
            # Select random telco causal
            causal = random.choice(telco_causals)
            title = causal["title"]
            description = causal["description"]
            category = causal["category"]
            priority = causal["priority"]
            
            # Debug output for first few tickets
            if i <= 5:
                print(f"🎫 Ticket {i}: {title} - {description[:50]}...")
            
            # Adjust priority based on status
            if random.random() < 0.1:  # 10% chance of emergency
                priority = "URGENT"
            
            status = random.choices(ticket_statuses, weights=[40, 30, 25, 5], k=1)[0]

            # Random creation time within last 90 days
            created_at = now - timedelta(days=random.randint(0, 90), hours=random.randint(0, 23), minutes=random.randint(0, 59))
            completed_at = None
            estimated_duration = random.choice([60, 90, 120, 180])

            # If completed, set a realistic completed_at after created_at
            if status == "COMPLETED":
                hours_to_complete = random.randint(1, 12)
                completed_at = created_at + timedelta(hours=hours_to_complete)

            # Random location data (Malaysia coordinates)
            location = f"Sample Address {i}"
            # Get zone from the cabinet member's state
            cabinet_member = malaysian_cabinet[(i - 1) % len(malaysian_cabinet)]
            zone = cabinet_member["state"]
            # Malaysia coordinates: roughly 1.0-7.0 N, 99.0-120.0 E
            lat = round(random.uniform(1.0, 7.0), 6)
            lng = round(random.uniform(99.0, 120.0), 6)
            coordinates = f"{lng},{lat}"

            # Random assignment to one of the actual teams
            if status in ("OPEN", "IN_PROGRESS", "COMPLETED"):
                team_result = conn.execute(text("SELECT id FROM teams ORDER BY RANDOM() LIMIT 1"))
                team_row = team_result.fetchone()
                assigned_team_id = team_row[0] if team_row else None
            else:
                assigned_team_id = None
            assigned_user_id = random.randint(1, 5) if random.random() > 0.5 else None

            conn.execute(text("""
                INSERT INTO tickets (
                    ticket_number, title, description, status, priority, category,
                    location, zone, coordinates, assigned_team_id, assigned_user_id,
                    customer_name, customer_contact, created_at, completed_at, estimated_duration
                )
                VALUES (
                    :ticket_number, :title, :description, :status, :priority, :category,
                    :location, :zone, :coordinates, :assigned_team_id, :assigned_user_id,
                    :customer_name, :customer_contact, :created_at, :completed_at, :estimated_duration
                )
                ON CONFLICT (ticket_number) DO NOTHING
            """), {
                "ticket_number": ticket_number,
                "title": title,
                "description": description,
                "status": status,
                "priority": priority,
                "category": category,
                "location": location,
                "zone": zone,
                "coordinates": coordinates,
                "assigned_team_id": assigned_team_id,
                "assigned_user_id": assigned_user_id,
                "customer_name": f"Customer {i}",
                "customer_contact": f"customer{i}@example.com",
                "created_at": created_at,
                "completed_at": completed_at,
                "estimated_duration": estimated_duration
            })
        
        # Insert sample assignments
        print("📋 Creating sample assignments...")
        for i in range(1, 31):  # Create 30 assignments
            # Get actual ticket IDs from the database
            ticket_result = conn.execute(text("SELECT id FROM tickets ORDER BY RANDOM() LIMIT 1"))
            ticket_row = ticket_result.fetchone()
            if not ticket_row:
                continue
            ticket_id = ticket_row[0]
            
            # Get actual team ID from database
            team_result = conn.execute(text("SELECT id FROM teams ORDER BY RANDOM() LIMIT 1"))
            team_row = team_result.fetchone()
            if not team_row:
                continue
            team_id = team_row[0]
            assigned_by = random.randint(1, 5)
            status = random.choice(["assigned", "in_progress", "completed"])
            
            conn.execute(text("""
                INSERT INTO assignments (ticket_id, team_id, assigned_by, status)
                VALUES (:ticket_id, :team_id, :assigned_by, :status)
                ON CONFLICT DO NOTHING
            """), {
                "ticket_id": ticket_id,
                "team_id": team_id,
                "assigned_by": assigned_by,
                "status": status
            })
        
        # Insert sample comments
        print("💬 Creating sample comments...")
        for i in range(1, 21):  # Create 20 comments
            # Get actual ticket IDs from the database
            ticket_result = conn.execute(text("SELECT id FROM tickets ORDER BY RANDOM() LIMIT 1"))
            ticket_row = ticket_result.fetchone()
            if not ticket_row:
                continue
            ticket_id = ticket_row[0]
            user_id = random.randint(1, 5)
            comment_text = f"This is a sample comment {i} for ticket {ticket_id}"
            
            conn.execute(text("""
                INSERT INTO comments (ticket_id, user_id, content)
                VALUES (:ticket_id, :user_id, :content)
            """), {
                "ticket_id": ticket_id,
                "user_id": user_id,
                "content": comment_text
            })
        
        conn.commit()
        print("✅ Database seeded successfully!")
        print("📊 Created:")
        print("   - 5 users")
        print("   - 150 teams")
        print("   - 1000 tickets (open, in_progress, completed, cancelled)")
        print("   - 30 assignments")
        print("   - 20 comments")

if __name__ == "__main__":
    seed_database()
