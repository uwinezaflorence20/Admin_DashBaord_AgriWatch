'use client';

import { useState, useEffect } from 'react';
import {
  TbTarget, TbPercentage, TbReportAnalytics, TbChartDots, TbLoader2, TbInfoCircle, TbPhotoOff, TbRefresh,
} from 'react-icons/tb';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { getModelMetrics, getConfusionMatrixUrl, getTrainingHistoryUrl } from '@/lib/api';
import { MOCK_MODEL_METRICS } from '@/data/modelMetrics';

const PIE_COLORS = ['#0F8410', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const formatClassName = (name) =>
  name.replace(/^Potato___/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ─── Image panel with loading / error states for the model API charts ─── */
function MetricImage({ src, alt }) {
  const [status, setStatus] = useState('loading');

  return (
    <div className="relative min-h-[260px] flex items-center justify-center bg-muted/20 rounded-xl overflow-hidden">
      {status !== 'error' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`max-w-full h-auto rounded-xl transition-opacity ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <TbLoader2 className="animate-spin" size={28} />
          <span className="text-xs text-center px-6">Loading chart… the model API may take up to a minute to wake up.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-16">
          <TbPhotoOff size={32} />
          <span className="text-xs">Could not load chart from the model API.</span>
        </div>
      )}
    </div>
  );
}

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [imgKey, setImgKey] = useState(0);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getModelMetrics();
      setMetrics(data);
      setUsingMockData(false);
    } catch (error) {
      setMetrics(MOCK_MODEL_METRICS);
      setUsingMockData(true);
    } finally {
      setLoading(false);
      setImgKey((k) => k + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <TbLoader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const { test_accuracy, classes, summary } = metrics;

  const overviewCards = [
    { label: 'Test Accuracy', value: test_accuracy / 100, icon: TbTarget, color: 'bg-accent' },
    { label: 'Precision (macro avg)', value: summary.macro_avg.precision, icon: TbPercentage, color: 'bg-blue-500' },
    { label: 'Recall (macro avg)', value: summary.macro_avg.recall, icon: TbChartDots, color: 'bg-purple-500' },
    { label: 'F1 Score (macro avg)', value: summary.macro_avg.f1_score, icon: TbReportAnalytics, color: 'bg-orange-500' },
  ];

  const classMetrics = Object.entries(classes).map(([name, m]) => ({
    name: formatClassName(name),
    precision: m.precision,
    recall: m.recall,
    f1: m.f1_score,
  }));

  const classDistribution = Object.entries(classes).map(([name, m]) => ({
    name: formatClassName(name),
    value: m.support,
  }));

  return (
    <div className="space-y-8">
      {usingMockData && (
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <span className="flex items-center gap-2">
            <TbInfoCircle size={16} />
            Couldn&apos;t reach the model API — showing the last known sample data.
          </span>
          <button onClick={fetchMetrics} className="flex items-center gap-1 text-orange-700 hover:underline">
            <TbRefresh size={14} /> Retry
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none bg-white shadow-sm h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-4 rounded-full text-white ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{(stat.value * 100).toFixed(2)}%</div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Confusion Matrix (image generated by model API) */}
        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <p className="text-sm text-muted-foreground">Generated by the model evaluation pipeline</p>
          </CardHeader>
          <CardContent>
            <MetricImage key={`cm-${imgKey}`} src={getConfusionMatrixUrl()} alt="Confusion Matrix" />
          </CardContent>
        </Card>

        {/* Training History (image generated by model API) */}
        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Training History</CardTitle>
            <p className="text-sm text-muted-foreground">Accuracy and loss across training epochs</p>
          </CardHeader>
          <CardContent>
            <MetricImage key={`th-${imgKey}`} src={getTrainingHistoryUrl()} alt="Training History" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Precision / Recall / F1 per class */}
        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Metrics by Class</CardTitle>
            <p className="text-sm text-muted-foreground">Precision, recall and F1-score per disease class</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classMetrics} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c8e6c9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 1]} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="precision" name="Precision" fill="#0F8410" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" name="Recall" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" name="F1 Score" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test set class distribution */}
        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Test Set Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Samples per class (total: {summary.accuracy.support})
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={classDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {classDistribution.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
