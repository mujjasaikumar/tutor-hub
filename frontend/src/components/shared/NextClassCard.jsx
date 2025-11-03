import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';
import { Clock, Video } from 'lucide-react';

export default function NextClassCard({ classData, onJoin }) {
  if (!classData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">No upcoming classes scheduled</p>
        </CardContent>
      </Card>
    );
  }

  const classDateTime = new Date(`${classData.class_date}T${classData.class_time}`);
  const now = new Date();
  const isLive = now >= classDateTime && now <= new Date(classDateTime.getTime() + 60 * 60 * 1000); // Within 1 hour

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Next Class
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold text-lg">{classData.batch_name}</p>
          {classData.topic && <p className="text-sm text-gray-600">{classData.topic}</p>}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CountdownTimer targetDate={classDateTime} />
        </div>

        {isLive && onJoin && (
          <Button
            onClick={onJoin}
            className="w-full bg-green-600 hover:bg-green-700"
            data-testid="join-live-class"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Now (Live)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
