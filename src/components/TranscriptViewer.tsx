import React from 'react';
import { Users } from 'lucide-react';
import { TranscriptData } from '../types';

interface TranscriptViewerProps {
  transcript: TranscriptData | [] | any;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcript }) => {
  console.log(transcript, "Transcript");
  return (
    <div className="flex-1 bg-white h-screen overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {transcript?.data?.title}
          </h1>
          <div className="text-sm text-gray-600 mb-4">
            {transcript?.data?.date}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Participants
          </h2>
          <div className="space-y-3">
            {transcript?.data?.participants?.map((participant: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium text-gray-900">{participant.name}</div>
                <div className="text-sm text-gray-600">{participant.title}</div>
                <div className="text-sm text-gray-500">{participant.company}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Transcript</h2>
          <div className="space-y-6">
            {transcript?.data?.segments?.map((segment: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
                <div className="font-medium text-gray-900 mb-2 flex items-center">
                  <span>{segment.speaker}</span>
                  {index === transcript?.data?.segments?.length - 1 && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Presentation
                    </span>
                  )}
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {segment.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptViewer;