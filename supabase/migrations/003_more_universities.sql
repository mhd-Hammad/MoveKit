-- ============================================================
-- More universities + campuses for demo
-- Run after 001 and 002
-- ============================================================

INSERT INTO university_domains (domain, university_name, country) VALUES
  -- Pakistan
  ('comsats.edu.pk', 'COMSATS University', 'PK'),
  ('itu.edu.pk', 'ITU Lahore', 'PK'),
  ('pucit.edu.pk', 'PUCIT', 'PK'),
  ('uol.edu.pk', 'University of Lahore', 'PK'),
  ('pu.edu.pk', 'Punjab University', 'PK'),
  ('qau.edu.pk', 'Quaid-i-Azam University', 'PK'),
  ('iiu.edu.pk', 'Islamic University Islamabad', 'PK'),
  ('bahria.edu.pk', 'Bahria University', 'PK'),
  -- USA
  ('berkeley.edu', 'UC Berkeley', 'US'),
  ('ucla.edu', 'UCLA', 'US'),
  ('umich.edu', 'University of Michigan', 'US'),
  ('columbia.edu', 'Columbia University', 'US'),
  ('nyu.edu', 'New York University', 'US'),
  ('gatech.edu', 'Georgia Tech', 'US'),
  ('illinois.edu', 'UIUC', 'US'),
  ('cmu.edu', 'Carnegie Mellon', 'US'),
  ('upenn.edu', 'UPenn', 'US'),
  ('cornell.edu', 'Cornell University', 'US'),
  -- UK
  ('ucl.ac.uk', 'University College London', 'GB'),
  ('kcl.ac.uk', 'Kings College London', 'GB'),
  ('ed.ac.uk', 'University of Edinburgh', 'GB'),
  ('manchester.ac.uk', 'University of Manchester', 'GB'),
  ('warwick.ac.uk', 'University of Warwick', 'GB'),
  ('lse.ac.uk', 'LSE', 'GB'),
  -- Canada
  ('mcgill.ca', 'McGill University', 'CA'),
  ('uwaterloo.ca', 'University of Waterloo', 'CA'),
  ('ualberta.ca', 'University of Alberta', 'CA'),
  -- Europe
  ('tud.nl', 'TU Delft', 'NL'),
  ('epfl.ch', 'EPFL', 'CH'),
  ('lmu.de', 'LMU Munich', 'DE'),
  ('polimi.it', 'Politecnico di Milano', 'IT'),
  ('kth.se', 'KTH Stockholm', 'SE'),
  -- Asia
  ('hku.hk', 'University of Hong Kong', 'HK'),
  ('kaist.ac.kr', 'KAIST', 'KR'),
  ('u-tokyo.ac.jp', 'University of Tokyo', 'JP'),
  ('anu.edu.au', 'ANU', 'AU'),
  ('unsw.edu.au', 'UNSW Sydney', 'AU'),
  ('monash.edu', 'Monash University', 'AU'),
  -- Middle East
  ('kaust.edu.sa', 'KAUST', 'SA'),
  ('aud.edu', 'American University of Dubai', 'AE')
ON CONFLICT (domain) DO NOTHING;

-- Add campuses for major universities that don't have one yet
INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 31.4100, 73.0800, 'subtropical', 'PK'
FROM university_domains WHERE domain = 'fast.edu.pk'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 33.7100, 73.0400, 'subtropical', 'PK'
FROM university_domains WHERE domain = 'comsats.edu.pk'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 31.4500, 74.3500, 'subtropical', 'PK'
FROM university_domains WHERE domain = 'itu.edu.pk'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 37.8719, -122.2585, 'mediterranean', 'US'
FROM university_domains WHERE domain = 'berkeley.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 34.0689, -118.4452, 'mediterranean', 'US'
FROM university_domains WHERE domain = 'ucla.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 40.8075, -73.9626, 'continental', 'US'
FROM university_domains WHERE domain = 'columbia.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 40.7295, -73.9965, 'continental', 'US'
FROM university_domains WHERE domain = 'nyu.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 51.5246, -0.1340, 'maritime', 'GB'
FROM university_domains WHERE domain = 'ucl.ac.uk'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 51.5115, -0.1160, 'maritime', 'GB'
FROM university_domains WHERE domain = 'kcl.ac.uk'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 45.5048, -73.5772, 'continental', 'CA'
FROM university_domains WHERE domain = 'mcgill.ca'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 43.4723, -80.5449, 'continental', 'CA'
FROM university_domains WHERE domain = 'uwaterloo.ca'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 37.4275, -122.1697, 'mediterranean', 'US'
FROM university_domains WHERE domain = 'stanford.edu'
ON CONFLICT DO NOTHING;

INSERT INTO campuses (university_domain_id, name, latitude, longitude, climate_zone, country_code)
SELECT id, 'Main Campus', 40.4433, -79.9436, 'continental', 'US'
FROM university_domains WHERE domain = 'cmu.edu'
ON CONFLICT DO NOTHING;
