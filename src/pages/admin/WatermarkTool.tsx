import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { addWatermark, shouldWatermark } from '@/lib/watermark';
import {
  Droplets,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Image as ImageIcon,
  AlertTriangle } from
'lucide-react';

interface TableConfig {
  name: string;
  displayName: string;
  table: string;
  imageField: string;
  isJsonArray?: boolean;
  jsonField?: string;
}

const TABLES_TO_PROCESS: TableConfig[] = [
{ name: 'siah', displayName: 'שיח הציבור', table: 'siah_hatzibur', imageField: 'cover_image_url' },
{ name: 'news', displayName: 'ניועס בציבור', table: 'news_batzibur', imageField: 'image_url' },
{ name: 'bein', displayName: 'בעין הציבור', table: 'bein_hatzibur', imageField: 'image_url' },
{ name: 'before18', displayName: 'לפני 18 שנה', table: 'before_18_years', imageField: 'images', isJsonArray: true, jsonField: 'url' },
{ name: 'historical', displayName: 'אירועים היסטוריים', table: 'historical_events', imageField: 'cover_image_url' },
{ name: 'historical_images', displayName: 'תמונות אירועים היסטוריים', table: 'historical_events', imageField: 'images', isJsonArray: true, jsonField: 'url' },
{ name: 'galleries', displayName: 'שערי גלריות', table: 'galleries', imageField: 'cover_image' },
{ name: 'gallery_images', displayName: 'תמונות גלריות', table: 'gallery_images', imageField: 'image_url' },
{ name: 'newspaper', displayName: 'שערי גליונות', table: 'newspaper_issues', imageField: 'cover_image_url' }];


interface ProcessingStatus {
  [key: string]: {
    status: 'idle' | 'processing' | 'done' | 'error';
    total: number;
    processed: number;
    skipped: number;
    errors: number;
    message?: string;
  };
}

export default function WatermarkTool() {
  const [processing, setProcessing] = useState<ProcessingStatus>({});
  const [isRunning, setIsRunning] = useState(false);

  const processImage = async (imageUrl: string): Promise<string | null> => {
    // Skip external URLs - can't process due to CORS
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Try to fetch and convert to base64
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            if (await shouldWatermark(base64)) {
              const watermarked = await addWatermark(base64);
              resolve(watermarked);
            } else {
              resolve(null); // Skip small images
            }
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null; // CORS error, skip
      }
    }

    // Process base64 images
    if (imageUrl.startsWith('data:')) {
      if (await shouldWatermark(imageUrl)) {
        return addWatermark(imageUrl);
      }
    }

    return null;
  };

  const processTable = async (config: TableConfig) => {
    if (!supabase) return;

    setProcessing((prev) => ({
      ...prev,
      [config.name]: { status: 'processing', total: 0, processed: 0, skipped: 0, errors: 0 }
    }));

    try {
      // Fetch all records
      const { data, error } = await supabase.
      from(config.table).
      select(`id, ${config.imageField}`);

      if (error) throw error;

      const records = data || [];
      setProcessing((prev) => ({
        ...prev,
        [config.name]: { ...prev[config.name], total: records.length }
      }));

      let processed = 0;
      let skipped = 0;
      let errors = 0;

      for (const record of records) {
        try {
          if (config.isJsonArray) {
            // Handle JSON array of images
            const images = record[config.imageField];
            if (Array.isArray(images) && images.length > 0) {
              const updatedImages = await Promise.all(
                images.map(async (img: any) => {
                  const url = img[config.jsonField!];
                  if (!url) return img;

                  const watermarked = await processImage(url);
                  if (watermarked) {
                    return { ...img, [config.jsonField!]: watermarked };
                  }
                  return img;
                })
              );

              // Check if any images were actually updated
              const hasChanges = updatedImages.some((img, i) =>
              img[config.jsonField!] !== images[i][config.jsonField!]
              );

              if (hasChanges) {
                await supabase.
                from(config.table).
                update({ [config.imageField]: updatedImages }).
                eq('id', record.id);
                processed++;
              } else {
                skipped++;
              }
            } else {
              skipped++;
            }
          } else {
            // Handle single image field
            const imageUrl = record[config.imageField];
            if (!imageUrl) {
              skipped++;
              continue;
            }

            const watermarked = await processImage(imageUrl);
            if (watermarked) {
              await supabase.
              from(config.table).
              update({ [config.imageField]: watermarked }).
              eq('id', record.id);
              processed++;
            } else {
              skipped++;
            }
          }
        } catch (err) {
          console.error(`Error processing record ${record.id}:`, err);
          errors++;
        }

        // Update progress
        setProcessing((prev) => ({
          ...prev,
          [config.name]: {
            ...prev[config.name],
            processed: processed + skipped + errors,
            skipped,
            errors
          }
        }));
      }

      setProcessing((prev) => ({
        ...prev,
        [config.name]: {
          status: 'done',
          total: records.length,
          processed,
          skipped,
          errors,
          message: `עודכנו ${processed} תמונות, דולגו ${skipped}, שגיאות ${errors}`
        }
      }));

    } catch (err: any) {
      setProcessing((prev) => ({
        ...prev,
        [config.name]: {
          status: 'error',
          total: 0,
          processed: 0,
          skipped: 0,
          errors: 1,
          message: err.message
        }
      }));
    }
  };

  const processAll = async () => {
    setIsRunning(true);
    for (const config of TABLES_TO_PROCESS) {
      await processTable(config);
    }
    setIsRunning(false);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <ImageIcon className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <AdminLayout>
      <div data-ev-id="ev_59dd22865e" className="p-6">
        {/* Header */}
        <div data-ev-id="ev_d2a69529ab" className="flex items-center justify-between mb-8">
          <div data-ev-id="ev_973e4e8292">
            <h1 data-ev-id="ev_c3125afbc8" className="text-2xl font-bold text-white flex items-center gap-3">
              <Droplets className="w-8 h-8 text-amber-500" />
              הוספת סימן מים לתמונות קיימות
            </h1>
            <p data-ev-id="ev_b5d4ffcbc2" className="text-zinc-400 mt-2">
              הכלי יעבור על כל התמונות במערכת ויוסיף את הלוגו כסימן מים
            </p>
          </div>

          <button data-ev-id="ev_9f77368e48"
          onClick={processAll}
          disabled={isRunning}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black disabled:text-zinc-400 px-6 py-3 rounded-xl font-bold transition-colors">

            {isRunning ?
            <>
                <Loader2 className="w-5 h-5 animate-spin" />
                מעבד...
              </> :

            <>
                <Play className="w-5 h-5" />
                הפעל על כל התמונות
              </>
            }
          </button>
        </div>

        {/* Warning */}
        <div data-ev-id="ev_8071597a26" className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div data-ev-id="ev_d349b23f75">
            <h3 data-ev-id="ev_7d7601f2fd" className="font-bold text-amber-500">שים לב</h3>
            <p data-ev-id="ev_8d6e9ac32a" className="text-zinc-300 text-sm mt-1">
              • התהליך עשוי לקחת מספר דקות בהתאם לכמות התמונות<br data-ev-id="ev_f9cd38e4db" />
              • תמונות חיצוניות (קישורים) יומרו לתמונות עם סימן מים<br data-ev-id="ev_8159e00bc0" />
              • תמונות קטנות מ-200 פיקסל ידולגו<br data-ev-id="ev_1f23f7d2cf" />
              • מומלץ לגבות את המידע לפני ההפעלה
            </p>
          </div>
        </div>

        {/* Tables List */}
        <div data-ev-id="ev_fbbb1db64d" className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div data-ev-id="ev_5a6356befa" className="p-4 border-b border-zinc-800">
            <h2 data-ev-id="ev_27cc4e90ca" className="font-bold text-white">טבלאות לעיבוד</h2>
          </div>

          <div data-ev-id="ev_9caaa4aab2" className="divide-y divide-zinc-800">
            {TABLES_TO_PROCESS.map((config) => {
              const status = processing[config.name];
              const progress = status?.total ? Math.round(status.processed / status.total * 100) : 0;

              return (
                <div data-ev-id="ev_99bf9db83f" key={config.name} className="p-4 flex items-center justify-between">
                  <div data-ev-id="ev_82653b1302" className="flex items-center gap-3">
                    {getStatusIcon(status?.status)}
                    <div data-ev-id="ev_f0a0991856">
                      <h3 data-ev-id="ev_260f003c1c" className="font-medium text-white">{config.displayName}</h3>
                      <p data-ev-id="ev_592c1b191c" className="text-sm text-zinc-500">{config.table}.{config.imageField}</p>
                    </div>
                  </div>

                  <div data-ev-id="ev_4864416534" className="flex items-center gap-4">
                    {status?.status === 'processing' &&
                    <div data-ev-id="ev_6e948b3e0e" className="flex items-center gap-3">
                        <div data-ev-id="ev_d57d343d0d" className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div data-ev-id="ev_f7219adeba"
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${progress}%` }} />

                        </div>
                        <span data-ev-id="ev_adc2f3c62d" className="text-sm text-zinc-400">
                          {status.processed}/{status.total}
                        </span>
                      </div>
                    }

                    {status?.status === 'done' &&
                    <span data-ev-id="ev_68abe047e6" className="text-sm text-green-400">
                        {status.message}
                      </span>
                    }

                    {status?.status === 'error' &&
                    <span data-ev-id="ev_57ca6215d7" className="text-sm text-red-400">
                        {status.message}
                      </span>
                    }

                    <button data-ev-id="ev_2692e4f9c4"
                    onClick={() => processTable(config)}
                    disabled={isRunning || status?.status === 'processing'}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-lg text-sm transition-colors">

                      הפעל
                    </button>
                  </div>
                </div>);

            })}
          </div>
        </div>

        {/* Summary */}
        {Object.values(processing).some((p) => p.status === 'done') &&
        <div data-ev-id="ev_7945b86579" className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <h3 data-ev-id="ev_3f518e474c" className="font-bold text-green-500 mb-2">סיכום</h3>
            <div data-ev-id="ev_f017dd93a0" className="grid grid-cols-3 gap-4">
              <div data-ev-id="ev_a290efa9e3" className="text-center">
                <div data-ev-id="ev_54cfd0a2e1" className="text-2xl font-bold text-white">
                  {Object.values(processing).reduce((sum, p) => sum + (p.processed || 0), 0)}
                </div>
                <div data-ev-id="ev_f42af0f75a" className="text-sm text-zinc-400">תמונות עודכנו</div>
              </div>
              <div data-ev-id="ev_c24d4d9eea" className="text-center">
                <div data-ev-id="ev_77b4c3282b" className="text-2xl font-bold text-white">
                  {Object.values(processing).reduce((sum, p) => sum + (p.skipped || 0), 0)}
                </div>
                <div data-ev-id="ev_8f2f27ce42" className="text-sm text-zinc-400">דולגו</div>
              </div>
              <div data-ev-id="ev_ccb3b3f5b5" className="text-center">
                <div data-ev-id="ev_d3ff013436" className="text-2xl font-bold text-white">
                  {Object.values(processing).reduce((sum, p) => sum + (p.errors || 0), 0)}
                </div>
                <div data-ev-id="ev_6a75acae24" className="text-sm text-zinc-400">שגיאות</div>
              </div>
            </div>
          </div>
        }
      </div>
    </AdminLayout>);

}