import { useState } from 'react';
import { Settings2, Key, FileText, Bell, Database, Download } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'api' | 'templates' | 'defaults' | 'notifications' | 'export'>('templates');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure API keys, templates, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === 'api' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Key size={16} /> API Keys
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === 'templates' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileText size={16} /> Launch Templates
          </button>
          <button
            onClick={() => setActiveTab('defaults')}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === 'defaults' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Settings2 size={16} /> Defaults
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === 'notifications' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Bell size={16} /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === 'export' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Database size={16} /> Data Export
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'api' && <ApiKeysTab />}
      {activeTab === 'templates' && <LaunchTemplatesTab />}
      {activeTab === 'defaults' && <DefaultsTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'export' && <DataExportTab />}
    </div>
  );
}

function ApiKeysTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">API Configuration</h3>
        <p className="text-sm text-slate-400 mb-6">
          Configure API keys for AI-powered features. These are stored securely and used server-side.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Anthropic API Key (Claude)
          </label>
          <input
            type="password"
            placeholder="sk-ant-..."
            className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Used for meeting summarization, weekly digest generation, and Program Brain RAG queries.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            OpenAI API Key (Whisper + Embeddings)
          </label>
          <input
            type="password"
            placeholder="sk-..."
            className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Used for audio transcription (Whisper) and vector embeddings for RAG.
          </p>
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
            Save API Keys
          </button>
        </div>
      </div>
    </div>
  );
}

function LaunchTemplatesTab() {
  const templates = [
    { type: 'migration', name: 'Migration Launch Template', gates: 6 },
    { type: 'price-increase', name: 'Price Increase Template', gates: 6 },
    { type: 'market-rollout', name: 'Market Rollout Template', gates: 6 },
    { type: 'other', name: 'Custom Template', gates: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Launch Checklist Templates</h3>
        <p className="text-sm text-slate-400 mb-6">
          Master templates for different program types. These are cloned when creating a new program's launch checklist.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {templates.map(template => (
          <div key={template.type} className="bg-slate-900/50 rounded border border-slate-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-white">{template.name}</h4>
                <p className="text-xs text-slate-500 capitalize">{template.type.replace('-', ' ')}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">
                {template.gates} gates
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
                Edit
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
          Create New Template
        </button>
      </div>
    </div>
  );
}

function DefaultsTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Default Settings</h3>
        <p className="text-sm text-slate-400 mb-6">
          Configure default values for new programs and settings.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Default Program Type
          </label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500">
            <option value="migration">Migration</option>
            <option value="price-increase">Price Increase</option>
            <option value="market-rollout">Market Rollout</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Default Launch Template
          </label>
          <select className="w-full bg-slate-900 border border-slate-800 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500">
            <option value="migration">Migration Launch Template</option>
            <option value="price-increase">Price Increase Template</option>
            <option value="market-rollout">Market Rollout Template</option>
            <option value="none">None (create blank)</option>
          </select>
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
            Save Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
        <p className="text-sm text-slate-400 mb-6">
          Configure when and how you want to be notified.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div>
            <div className="text-sm font-medium text-white">Weekly Status Reminders</div>
            <div className="text-xs text-slate-500">Get reminded on Thursdays if status updates are missing</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div>
            <div className="text-sm font-medium text-white">Overdue Gate Alerts</div>
            <div className="text-xs text-slate-500">Notify when launch gates become overdue with incomplete items</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div>
            <div className="text-sm font-medium text-white">Meeting Processing Complete</div>
            <div className="text-xs text-slate-500">Notify when meeting transcription and summarization is complete</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-medium text-white">Digest Auto-Generation</div>
            <div className="text-xs text-slate-500">Automatically generate weekly digest every Friday at 4 PM</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

function DataExportTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Data Export</h3>
        <p className="text-sm text-slate-400 mb-6">
          Export your data for backup or analysis.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900/50 rounded border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-white">Full Data Export</h4>
              <p className="text-xs text-slate-500">All programs, meetings, statuses, and documents in JSON format</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-white">Per-Program Export</h4>
              <p className="text-xs text-slate-500">Export individual program as ZIP with all artifacts</p>
            </div>
            <select className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
              <option>Select program...</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-white">Meeting Transcripts</h4>
              <p className="text-xs text-slate-500">Export all meeting transcripts as text files</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
