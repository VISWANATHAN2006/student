import React, { useState, useEffect } from 'react';
import { filesApi } from '../../api/files';
import { academicApi } from '../../api/academic';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookOpen,
  FileQuestion,
  Download,
  FileText,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react';

export const StudentMaterials = ({ initialTab = 'notes' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notes, setNotes] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notesRes, qbRes, subsRes] = await Promise.allSettled([
          filesApi.getNotes(selectedSubject || null),
          filesApi.getQuestionBank(selectedSubject || null),
          academicApi.getSubjects(),
        ]);

        if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value)) {
          setSubjects(subsRes.value);
        }

        if (notesRes.status === 'fulfilled' && Array.isArray(notesRes.value)) {
          setNotes(notesRes.value);
        } else {
          // Demo fallback notes
          setNotes([
            { id: 1, title: 'Unit 1 & 2: Java Fundamentals & OOPs Concepts', subject_id: 1, file_url: '#', file_size_kb: 2450, uploaded_at: '2026-08-14' },
            { id: 2, title: 'Unit 3: Multithreading & Exception Handling Handout', subject_id: 1, file_url: '#', file_size_kb: 1820, uploaded_at: '2026-08-10' },
            { id: 3, title: 'Data Structures: Binary Trees & Graphs Complete Notes', subject_id: 2, file_url: '#', file_size_kb: 4100, uploaded_at: '2026-08-08' },
            { id: 4, title: 'SQL & Normalization Quick Revision Guide', subject_id: 3, file_url: '#', file_size_kb: 1200, uploaded_at: '2026-08-05' },
          ]);
        }

        if (qbRes.status === 'fulfilled' && Array.isArray(qbRes.value)) {
          setQuestionBank(qbRes.value);
        } else {
          // Demo fallback question bank items
          setQuestionBank([
            { id: 1, title: 'April 2025 University Question Paper (Solved)', subject_id: 1, file_url: '#', file_size_kb: 3200, uploaded_at: '2026-08-12' },
            { id: 2, title: 'November 2024 End Semester Question Paper', subject_id: 2, file_url: '#', file_size_kb: 2800, uploaded_at: '2026-08-09' },
            { id: 3, title: 'Model Exam 2026 - Expected 2 Marks & 16 Marks Bank', subject_id: 3, file_url: '#', file_size_kb: 1950, uploaded_at: '2026-08-02' },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSubject]);

  const currentList = activeTab === 'notes' ? notes : questionBank;
  const filteredList = currentList.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectName = (subjectId) => {
    const sub = subjects.find((s) => s.id === subjectId);
    return sub ? sub.name : `Subject #${subjectId}`;
  };

  const formatSize = (kb) => {
    if (!kb) return '—';
    if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            {activeTab === 'notes' ? (
              <BookOpen size={28} color="var(--primary-400)" />
            ) : (
              <FileQuestion size={28} color="var(--accent-cyan)" />
            )}
            Digital Academic Repository
          </h1>
          <p className="page-subtitle">
            Download faculty uploaded course notes, lecture handouts, and previous exam question papers
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem',
            gap: '0.25rem',
          }}
        >
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'notes' ? 'var(--grad-primary)' : 'transparent',
              color: activeTab === 'notes' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <BookOpen size={16} /> Course Notes
          </button>
          <button
            onClick={() => setActiveTab('qb')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeTab === 'qb' ? 'var(--grad-accent)' : 'transparent',
              color: activeTab === 'qb' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <FileQuestion size={16} /> Question Bank
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder={`Search ${activeTab === 'notes' ? 'notes' : 'question papers'} by title...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search
            size={17}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            className="form-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <Loader text={`Loading ${activeTab === 'notes' ? 'course notes' : 'question bank'}...`} />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={activeTab === 'notes' ? BookOpen : FileQuestion}
          title={`No ${activeTab === 'notes' ? 'notes' : 'question papers'} found`}
          description="No files match your filter or search query."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredList.map((item) => {
            const subjectTitle = getSubjectName(item.subject_id);

            return (
              <div key={item.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <Badge variant="cyan" size="sm">
                      {subjectTitle}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.uploaded_at ? String(item.uploaded_at).slice(0, 10) : 'Recent'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: 'var(--primary-400)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={22} />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.975rem', fontWeight: 600, lineHeight: 1.35, marginBottom: '0.25rem' }}>
                        {item.title}
                      </h4>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                        Size: {formatSize(item.file_size_kb)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <a
                    href={item.file_url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem' }}
                    onClick={(e) => {
                      if (!item.file_url || item.file_url === '#') {
                        e.preventDefault();
                        alert('Demo study material: File download simulated successfully!');
                      }
                    }}
                  >
                    <Download size={14} /> Download Document
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
