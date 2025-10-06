import { supabase } from "@/integrations/supabase/client";
import { Stage1Result } from "@/types/stage1";

export class Stage1Service {
  static async filterNews(newsContent: string, sourceUrl?: string): Promise<Stage1Result> {
    try {
      const { data, error } = await supabase.functions.invoke('stage1-filter', {
        body: { newsContent, sourceUrl }
      });

      if (error) {
        console.error('Stage 1 filter error:', error);
        throw new Error('Failed to run Stage 1 filter');
      }

      return data as Stage1Result;
    } catch (error) {
      console.error('Stage 1 service error:', error);
      throw error;
    }
  }
}
