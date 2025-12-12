"use client";

import * as React from "react";
import { X } from 'lucide-react';

interface AddTradeModalProps {
  onClose: () => void;
}

export function AddTradeModal({ onClose }: AddTradeModalProps) {
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    symbol: '',
    type: 'LONG',
    entry: '',
    exit: '',
    size: '',
    setup: '',
    emotions: '',
    tags: '',
    notes: '',
    mistakes: '',
    lessonsLearned: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-white text-xl">Add Trade Entry</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Symbol and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., NQ, ES, YM"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Direction</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
          </div>

          {/* Entry, Exit, Size */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Entry Price</label>
              <input
                type="number"
                name="entry"
                value={formData.entry}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Exit Price</label>
              <input
                type="number"
                name="exit"
                value={formData.exit}
                onChange={handleChange}
                step="0.01"
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Size</label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="1"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Setup */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Setup Type</label>
            <input
              type="text"
              name="setup"
              value={formData.setup}
              onChange={handleChange}
              placeholder="e.g., Breakout, Reversal, Pullback"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Emotions */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Emotions (comma separated)</label>
            <input
              type="text"
              name="emotions"
              value={formData.emotions}
              onChange={handleChange}
              placeholder="e.g., Confident, Focused, Anxious"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., Trend Following, High Probability"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Trade Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="What happened during the trade? How did you feel?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Mistakes */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Mistakes Made</label>
            <textarea
              name="mistakes"
              value={formData.mistakes}
              onChange={handleChange}
              rows={2}
              placeholder="What could you have done better?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Lessons Learned</label>
            <textarea
              name="lessonsLearned"
              value={formData.lessonsLearned}
              onChange={handleChange}
              rows={2}
              placeholder="What did you learn from this trade?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors"
            >
              Add Entry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
