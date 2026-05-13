-- Table for editable site pages (Terms, Privacy, Accessibility)
CREATE TABLE public.site_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for slug lookup
CREATE INDEX idx_site_pages_slug ON public.site_pages(slug);

-- Insert default pages
INSERT INTO public.site_pages (slug, title, content, meta_description) VALUES
('terms', 'תנאי שימוש', '<h2>תנאי שימוש באתר</h2><p>ברוכים הבאים לאתר הציבור החרדי. השימוש באתר זה כפוף לתנאים המפורטים להלן.</p><h3>1. הסכמה לתנאים</h3><p>בעצם השימוש באתר, הנך מסכים לתנאי שימוש אלה.</p><h3>2. זכויות יוצרים</h3><p>כל התכנים באתר, לרבות טקסטים, תמונות, סרטונים וגרפיקה, הם רכוש האתר ומוגנים בזכויות יוצרים.</p><h3>3. שימוש מותר</h3><p>מותר לעיין בתכני האתר לשימוש אישי בלבד. אין להעתיק, לשכפל או להפיץ תכנים ללא אישור בכתב.</p>', 'תנאי השימוש באתר הציבור החרדי'),
('privacy', 'מדיניות פרטיות', '<h2>מדיניות פרטיות</h2><p>אנו מכבדים את פרטיותכם ומחויבים להגן על המידע האישי שלכם.</p><h3>1. איסוף מידע</h3><p>אנו אוספים מידע שאתם מוסרים לנו מרצונכם, כגון כתובת אימייל להרשמה לעדכונים.</p><h3>2. שימוש במידע</h3><p>המידע משמש אותנו לשליחת עדכונים ותכנים רלוונטיים.</p><h3>3. אבטחת מידע</h3><p>אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלכם.</p><h3>4. עוגיות (Cookies)</h3><p>האתר משתמש בעוגיות לשיפור חווית הגלישה.</p>', 'מדיניות הפרטיות של אתר הציבור החרדי'),
('accessibility', 'הצהרת נגישות', '<h2>הצהרת נגישות</h2><p>אתר הציבור החרדי מחויב להנגשת תכניו לכלל הציבור, לרבות אנשים עם מוגבלויות.</p><h3>1. תקן הנגישות</h3><p>האתר נבנה בהתאם להנחיות WCAG 2.1 ברמה AA.</p><h3>2. התאמות נגישות</h3><p>האתר כולל התאמות לקוראי מסך, ניווט מקלדת, וניגודיות צבעים מתאימה.</p><h3>3. יצירת קשר</h3><p>נתקלתם בבעיית נגישות? צרו קשר ונשמח לסייע.</p><h3>4. עדכון אחרון</h3><p>הצהרה זו עודכנה לאחרונה בתאריך 01/01/2024.</p>', 'הצהרת הנגישות של אתר הציבור החרדי');

-- Table for ad requests from public
CREATE TABLE public.ad_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Contact info
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  business_name TEXT,
  -- Ad details
  ad_type TEXT NOT NULL, -- 'banner-top', 'banner-side', 'banner-content', 'sponsored'
  ad_size TEXT NOT NULL, -- '728x90', '300x250', '160x600', etc.
  duration TEXT NOT NULL, -- '1week', '2weeks', '1month', '3months'
  -- Files
  image_url TEXT,
  target_url TEXT,
  -- Additional
  notes TEXT,
  budget_range TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'approved', 'rejected'
  admin_notes TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ad_requests_status ON public.ad_requests(status);
CREATE INDEX idx_ad_requests_created ON public.ad_requests(created_at DESC);

-- RLS Policies for site_pages (public read, admin write)
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published site pages"
  ON public.site_pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated can manage site pages"
  ON public.site_pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ad_requests (anyone can insert, admin can read/update)
ALTER TABLE public.ad_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit ad requests"
  ON public.ad_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can view ad requests"
  ON public.ad_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update ad requests"
  ON public.ad_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);