import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { updateGeneratedProposal } from '../services/generatedProposals';

const safeParseContentSections = (contentSections) => {
  if (!contentSections) return null;
  if (typeof contentSections === 'string') return JSON.parse(contentSections);
  return contentSections;
};

const ProposalPreview = ({ proposalData, onSaved }) => {
  const printRef = useRef();

  const initialContent = useMemo(
    () => safeParseContentSections(proposalData?.content_sections),
    [proposalData]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [content, setContent] = useState(initialContent);

  // If proposalData changes (new fetch), refresh local content.
  React.useEffect(() => {
    setContent(initialContent);
    setIsEditing(false);
    setSaveError(null);
    setSaveStatus(null);
    setAutoSaveEnabled(false);
  }, [initialContent]);

  // Debounced autosave while editing.
  React.useEffect(() => {
    if (!isEditing || !autoSaveEnabled) return;
    if (!proposalData?.id) return;
    if (!content) return;

    const timeout = setTimeout(async () => {
      // Don't autosave while a manual save is in-flight.
      if (isSaving) return;

      try {
        setSaveStatus('Saving…');
        await updateGeneratedProposal(proposalData.id, { content_sections: content });
        setSaveStatus('All changes saved');
        setSaveError(null);
      } catch (e) {
        setSaveStatus(null);
        setSaveError(e?.message || 'Autosave failed.');
      }
    }, 900);

    return () => clearTimeout(timeout);
  }, [autoSaveEnabled, content, isEditing, isSaving, proposalData?.id]);

  const handleTextChange = (key, value) => {
    setContent((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const handleArrayChange = (key, index, value) => {
    setContent((prev) => {
      const base = prev || {};
      const arr = Array.isArray(base[key]) ? [...base[key]] : [];
      arr[index] = value;
      return { ...base, [key]: arr };
    });
  };

  const handleArrayAdd = (key, defaultValue = '') => {
    setContent((prev) => {
      const base = prev || {};
      const arr = Array.isArray(base[key]) ? [...base[key]] : [];
      arr.push(defaultValue);
      return { ...base, [key]: arr };
    });
  };

  const handleArrayRemove = (key, index) => {
    setContent((prev) => {
      const base = prev || {};
      const arr = Array.isArray(base[key]) ? [...base[key]] : [];
      arr.splice(index, 1);
      return { ...base, [key]: arr };
    });
  };

  const handleExportPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    // Higher resolution export
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${content?.project_title || 'proposal'}.pdf`);
  };

  const handleSave = async () => {
    if (!proposalData?.id) {
      setSaveError('Missing generated proposal id.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
  setSaveStatus('Saving…');

    try {
      const updated = await updateGeneratedProposal(proposalData.id, {
        content_sections: content,
      });
      setIsEditing(false);
      setAutoSaveEnabled(false);
      setSaveStatus('All changes saved');
      onSaved?.(updated);
    } catch (e) {
      setSaveError(e?.message || 'Failed to save changes.');
      setSaveStatus(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
    setAutoSaveEnabled(false);
    setSaveError(null);
    setSaveStatus(null);
  };

  const renderField = (key, variant = 'body1', multiline = false) => {
    if (isEditing) {
      return (
        <TextField
          fullWidth
          multiline={multiline}
          minRows={multiline ? 3 : undefined}
          variant="outlined"
          size="small"
          value={content?.[key] || ''}
          onChange={(e) => handleTextChange(key, e.target.value)}
          sx={{ mb: 1, mt: 1 }}
        />
      );
    }

    return (
      <Typography variant={variant} sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {content?.[key]}
      </Typography>
    );
  };

  if (!content) return <Typography>No proposal generated yet.</Typography>;

  return (
    <Box sx={{ maxWidth: '210mm', margin: 'auto', p: 2 }}>
      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<PrintIcon />} onClick={() => window.print()} disabled={isEditing}>
          Print
        </Button>

        {isEditing ? (
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Switch
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                disabled={isSaving}
              />
            }
            label="Autosave"
          />
        ) : null}

        {isEditing ? (
          <>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
            Edit Mode
          </Button>
        )}

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportPDF}
          disabled={isEditing}
        >
          Download PDF
        </Button>
      </Box>

      {saveError ? (
        <Typography sx={{ mb: 2 }} color="error">
          {saveError}
        </Typography>
      ) : null}

      {isEditing && saveStatus ? (
        <Typography sx={{ mb: 2 }} color="text.secondary">
          {saveStatus}
        </Typography>
      ) : null}

      {/* The A4 Paper Visual */}
      <Paper
        ref={printRef}
        elevation={3}
        sx={{
          width: '100%',
          minHeight: '297mm',
          p: '25mm',
          bgcolor: 'white',
          color: 'black',
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {isEditing ? (
            <TextField
              label="Project Title"
              value={content?.project_title || ''}
              onChange={(e) => handleTextChange('project_title', e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1a237e' }}>
              {content?.project_title}
            </Typography>
          )}

          <Typography variant="subtitle1" color="text.secondary">
            Prepared for: {proposalData?.client_name || 'Client Name'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* 1. Introduction */}
        <Section title="1. Introduction">{renderField('introduction', 'body1', true)}</Section>

        {/* 2. Objectives */}
        <Section title="2. Objectives">
          {isEditing ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleArrayAdd('objectives', '')}
              >
                Add objective
              </Button>
            </Box>
          ) : null}
          <ul>
            {(content?.objectives || []).map((obj, index) => (
              <li key={index}>
                {isEditing ? (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={obj || ''}
                      onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                    />
                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleArrayRemove('objectives', index)}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    {obj}
                  </Typography>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* 3. Problem Statement */}
        <Section title="3. Problem Statement">{renderField('problem_statement', 'body1', true)}</Section>

        {/* 4. Proposed Solution */}
        <Section title="4. Proposed Solution">{renderField('proposed_system', 'body1', true)}</Section>

        {/* 5. Main Modules (Grid Layout) */}
        <Section title="5. Main Modules">
          {isEditing ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleArrayAdd('main_modules', '')}
              >
                Add module
              </Button>
            </Box>
          ) : null}
          <Grid container spacing={2}>
            {(content?.main_modules || []).map((module, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Module {index + 1}
                    </Typography>
                    {isEditing ? (
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleArrayRemove('main_modules', index)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </Box>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      value={module || ''}
                      onChange={(e) => handleArrayChange('main_modules', index, e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  ) : (
                    <Typography variant="body2">{module}</Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* 6. Tools & Tech */}
        <Section title="6. Tools & Technology">
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Tools & Technology (comma-separated or paragraph)"
              value={content?.tools_and_technology || ''}
              onChange={(e) => handleTextChange('tools_and_technology', e.target.value)}
            />
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(Array.isArray(content?.tools_and_technology)
                ? content.tools_and_technology
                : content?.tools_and_technology?.split(','))
                ?.filter(Boolean)
                ?.map((tool, i) => (
                  <Chip
                    key={i}
                    label={String(tool).trim()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
            </Box>
          )}
        </Section>

        {/* Footer */}
        <Box sx={{ mt: 8, pt: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Generated by BizMind AI
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="h6"
      sx={{
        fontWeight: 'bold',
        borderBottom: '2px solid #1976d2',
        display: 'inline-block',
        mb: 2,
        pb: 0.5,
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

export default ProposalPreview;
