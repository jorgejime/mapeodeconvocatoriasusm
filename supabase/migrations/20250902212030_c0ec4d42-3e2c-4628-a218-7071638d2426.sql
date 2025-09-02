-- Update passwords for existing users
-- First, update admin user password
UPDATE auth.users 
SET encrypted_password = crypt('USM2025', gen_salt('bf'))
WHERE email = 'admin@usm.edu.co';

-- Update rectoria user password  
UPDATE auth.users 
SET encrypted_password = crypt('USM2025', gen_salt('bf'))
WHERE email = 'rectoria@usm.edu.co';