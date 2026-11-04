-- 老師後台 Direction 已儲存但學生端沒有出現時，可在 Supabase SQL Editor 執行：
select
  part_number,
  title,
  status,
  audio_url,
  directions_text
from public.speaking_directions
order by part_number;

-- 學生端只讀取 status = 'active' 的 Direction。
