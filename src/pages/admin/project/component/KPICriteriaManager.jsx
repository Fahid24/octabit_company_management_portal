import React, { useState } from 'react';
import { Plus, Edit3, Save, X, Award, Target, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/component/Progress';
import { Badge } from '@/component/badge';
import Button from '@/component/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/component/card';
import { FloatingInput } from '@/component/FloatiingInput';

const KPICriteriaManager = ({ department, criteria, onChange, onError }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newCriteria, setNewCriteria] = useState({ name: '', weight: '' });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDraft, setEditDraft] = useState({ name: '', weight: '' });
  const [error, setError] = useState('');

  const totalWeight = criteria.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const remainingWeight = 100 - totalWeight;

  const handleError = (msg) => {
    setError(msg);
    if (onError) onError(msg);
  };

  const addCriteria = () => {
    if (!newCriteria.name || !newCriteria.weight) {
      handleError('Please fill in both criteria name and weight');
      return;
    }
    if (criteria.some(c => c.criteria === newCriteria.name)) {
      handleError('Criteria name already exists');
      return;
    }
    const weight = Number(newCriteria.weight);
    if (weight <= 0 || weight > remainingWeight) {
      handleError(`Weight must be between 1 and ${remainingWeight}`);
      return;
    }
    onChange([...criteria, { criteria: newCriteria.name, value: weight }]);
    setNewCriteria({ name: '', weight: '' });
    handleError('');
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setEditDraft({ name: criteria[index].criteria, weight: criteria[index].value });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!editDraft.name || !editDraft.weight) {
      handleError('Please fill in both criteria name and weight');
      return;
    }
    if (criteria.some((c, i) => c.criteria === editDraft.name && i !== editingIndex)) {
      handleError('Criteria name already exists');
      return;
    }
    const weight = Number(editDraft.weight);
    if (weight <= 0 || weight > 100) {
      handleError('Weight must be between 1 and 100');
      return;
    }
    const updated = criteria.map((item, i) =>
      i === editingIndex ? { criteria: editDraft.name, value: weight } : item
    );
    onChange(updated);
    setShowEditModal(false);
    setEditingIndex(-1);
    handleError('');
  };

  const removeCriteria = (index) => {
    onChange(criteria.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full p-0">
      <div className="w-full">
        {/* Header */}
        <CardHeader className="cursor-pointer px-4 pt-4 pb-2" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg shadow-sm">
                <Target className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <CardTitle className="font-bold text-slate-800 text-xl md:text-2xl">KPI Criteria</CardTitle>
                <p className="text-xs md:text-sm text-slate-500">{criteria.length} defined</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs md:text-sm text-slate-500">Total Weight</div>
                <div className={`font-bold text-lg md:text-xl ${totalWeight === 100 ? 'text-emerald-600' : totalWeight > 100 ? 'text-red-600' : 'text-blue-600'}`}>{totalWeight}%</div>
              </div>
              {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </div>
          </div>
          <div className="mt-3">
            <Progress value={totalWeight} max={100} variant={totalWeight === 100 ? 'success' : totalWeight > 100 ? 'danger' : 'info'} />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span className={totalWeight === 100 ? 'text-emerald-600 font-medium' : ''}>
                {totalWeight === 100 ? 'Complete' : `${remainingWeight}% left`}
              </span>
              <span>100%</span>
            </div>
          </div>
        </CardHeader>
        {/* Content */}
        {isExpanded && (
          <CardContent className="pt-2 pb-4 px-4 ">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            {/* Responsive layout: two columns on md+, stacked on mobile */}
            <div className="flex flex-col md:flex-row md:gap-8">
              {/* Add New Criteria */}
              <div className="flex-1 mb-6 md:mb-0 md:max-w-xs">
                <div className="font-semibold text-slate-700 mb-2 text-base md:text-lg">Add New Criteria</div>
                <div className="flex flex-col gap-2">
                  <FloatingInput
                    type="text"
                    label="Criteria Name"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                    className="w-full"
                    autoComplete="off"
                  />
                  <FloatingInput
                    type="number"
                    label="Weight (%)"
                    min={1}
                    max={remainingWeight}
                    value={newCriteria.weight}
                    onChange={(e) => setNewCriteria({ ...newCriteria, weight: e.target.value })}
                    className="w-full"
                    autoComplete="off"
                  />
                  <Button
                    variant="success"
                    icon={<Plus className="h-5 w-5" />}
                    onClick={addCriteria}
                    className="w-full h-12 mt-2 text-base"
                    size="lg"
                    aria-label="Add criteria"
                  >
                    Add
                  </Button>
                </div>
              </div>
              {/* Existing Criteria List */}
              <div className="flex-1">
                <div className="font-semibold text-slate-700 mb-2 text-base md:text-lg">Defined Criteria</div>
                <div className="space-y-3">
                  {criteria.map((item, index) => (
                    <div
                      key={index}
                      className="group bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-2 transition-all duration-200 hover:shadow-md hover:border-blue-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800 truncate text-base md:text-lg">{item.criteria}</div>
                          <div className="text-xs text-slate-500">Performance metric</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" className="font-semibold text-base px-3 py-1">
                          {item.value}%
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          icon={<Edit3 className="h-4 w-4" />}
                          onClick={() => openEditModal(index)}
                          aria-label="Edit criteria"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          icon={<X className="h-4 w-4" />}
                          onClick={() => removeCriteria(index)}
                          aria-label="Remove criteria"
                        />
                      </div>
                    </div>
                  ))}
                  {criteria.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Target className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                      <p className="font-medium">No KPI criteria yet</p>
                      <p className="text-xs">Add criteria to define performance metrics</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </div>
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Button
          variant="success"
          size="icon"
          className="rounded-full shadow-lg h-14 w-14"
          icon={<Plus className="h-7 w-7" />}
          onClick={addCriteria}
          aria-label="Add criteria"
        />
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90vw] max-w-sm mx-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-slate-800">Edit Criteria</h2>
              <Button variant="ghost" size="icon" icon={<X className="h-5 w-5" />} onClick={() => setShowEditModal(false)} aria-label="Close" />
            </div>
            <FloatingInput
              type="text"
              label="Criteria Name"
              value={editDraft.name}
              onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
              className="mb-3"
              autoFocus
            />
            <FloatingInput
              type="number"
              label="Weight (%)"
              min={1}
              max={100}
              value={editDraft.weight}
              onChange={(e) => setEditDraft({ ...editDraft, weight: e.target.value })}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button variant="success" size="lg" icon={<Save className="h-4 w-4" />} onClick={saveEdit}>Save</Button>
              <Button variant="secondary" size="lg" onClick={() => setShowEditModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICriteriaManager; 