"use client";

import * as React from "react";
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, AlertCircle, Lightbulb, Image as ImageIcon, Tag } from 'lucide-react';

interface Entry {
  id: string;
  date: string;
  time: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  setup: string;
  emotions: string[];
  tags: string[];
  notes: string;
  screenshot: string | null;
  mistakes: string[];
  lessonsLearned: string;
}

interface JournalEntryProps {
  entry: Entry;
}

export function JournalEntry({ entry }: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isProfitable = entry.pnl >= 0;

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition-colors">
      {/* Header - Always Visible */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              entry.type === 'LONG' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              {entry.type === 'LONG' ? (
                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-red-500" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white text-lg">{entry.symbol}</h3>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  entry.type === 'LONG' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  {entry.type}
                </span>
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                  {entry.setup}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <span>{entry.date}</span>
                <span>•</span>
                <span>{entry.time}</span>
                <span>•</span>
                <span>{entry.size} contracts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-xl ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                {isProfitable ? '+' : ''}${entry.pnl.toFixed(2)}
              </div>
              <div className={`text-sm ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                {isProfitable ? '+' : ''}{entry.pnlPercent.toFixed(2)}%
              </div>
            </div>
            
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-500" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-zinc-800 p-5 space-y-5 bg-zinc-900/30">
          {/* Trade Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-zinc-500 text-xs mb-1">Entry Price</div>
              <div className="text-white">${entry.entry.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Exit Price</div>
              <div className="text-white">${entry.exit.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Position Size</div>
              <div className="text-white">{entry.size} contracts</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Points Captured</div>
              <div className="text-white">
                {Math.abs(entry.exit - entry.entry).toFixed(2)} pts
              </div>
            </div>
          </div>

          {/* Emotions */}
          {entry.emotions.length > 0 && (
            <div>
              <div className="text-zinc-400 text-sm mb-2">Emotional State</div>
              <div className="flex flex-wrap gap-2">
                {entry.emotions.map((emotion) => (
                  <span
                    key={emotion}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div>
              <div className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div>
              <div className="text-zinc-400 text-sm mb-2">Trade Notes</div>
              <div className="p-4 bg-zinc-800/50 rounded-lg text-zinc-300 text-sm">
                {entry.notes}
              </div>
            </div>
          )}

          {/* Mistakes */}
          {entry.mistakes.length > 0 && (
            <div>
              <div className="text-red-400 text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Mistakes to Avoid</span>
              </div>
              <ul className="space-y-2">
                {entry.mistakes.map((mistake, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                  >
                    <span className="text-red-500 text-sm">•</span>
                    <span className="text-zinc-300 text-sm">{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lessons Learned */}
          {entry.lessonsLearned && (
            <div>
              <div className="text-emerald-400 text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span>Lessons Learned</span>
              </div>
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-zinc-300 text-sm">
                {entry.lessonsLearned}
              </div>
            </div>
          )}

          {/* Screenshot Placeholder */}
          <div>
            <div className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Chart Screenshot</span>
            </div>
            <div className="w-full h-48 bg-zinc-800/50 border border-zinc-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No screenshot uploaded</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
