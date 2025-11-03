"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Mic } from 'lucide-react';
import { ListeningParagraphs } from './components/ListeningParagraphs';
import { WritingExercises } from './components/WritingExercises';
import { SpeakingLessons } from './components/SpeakingLessons';
export default function Content() {
  const [view, setView] = useState<'listening' | 'writing' | 'speaking'>('listening');

  return (
    <div className="flex-1 px-6 py-3 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Button
              variant={view === 'listening' ? 'default' : 'outline'}
              onClick={() => setView('listening')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Listening Paragraphs
            </Button>
            <Button
              variant={view === 'writing' ? 'default' : 'outline'}
              onClick={() => setView('writing')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Writing Exercises
            </Button>
            <Button
              variant={view === 'speaking' ? 'default' : 'outline'}
              onClick={() => setView('speaking')}
            >
              <Mic className="w-4 h-4 mr-2" />
              Speaking Lessons
            </Button>
          </div>
        </CardContent>
      </Card>

      {view === 'listening' && <ListeningParagraphs />}
      {view === 'writing' && <WritingExercises />}
      {view === 'speaking' && <SpeakingLessons />}
    </div>
  );
}
