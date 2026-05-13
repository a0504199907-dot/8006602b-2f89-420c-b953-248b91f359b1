-- Verify and fix newspaper_issues table if needed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'newspaper_issues' 
ORDER BY ordinal_position;