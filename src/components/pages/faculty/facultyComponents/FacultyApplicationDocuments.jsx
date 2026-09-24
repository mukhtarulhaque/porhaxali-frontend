import { useEffect, useRef, useState } from 'react';
import { Eye, FileUp, Paperclip, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
    confirmDocumentUpload,
    deleteDocument,
    getDocumentViewUrl,
    getRequiredDocumentTypes,
    requestDocumentUpload,
    uploadFileToR2,
} from '../../../../api/InstructorApplication';
import { validateDocumentFile } from '../instructorApplicationConfig';

const apiMessage = (error, fallback) => error.response?.data?.message ?? fallback;

const formatSize = (bytes) => {
    if (bytes == null) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const friendlyDeleteError = (error) => error.response?.status === 403
    ? 'Unable to delete this document at the moment.'
    : apiMessage(error, 'Unable to delete this document.');

export default function FacultyApplicationDocuments({ documents, isDraft, onRefresh }) {
    const [selectedFiles, setSelectedFiles] = useState({});
    const [operations, setOperations] = useState({});
    const [requiredTypes, setRequiredTypes] = useState([]);
    const [typesError, setTypesError] = useState('');

    useEffect(() => {
        let active = true;
        getRequiredDocumentTypes()
            .then((types) => {
                if (active) setRequiredTypes(types);
            })
            .catch((error) => {
                console.error('Unable to load required document types', error);
                if (active) setTypesError(apiMessage(error, 'Unable to load the required document list.'));
            });
        return () => { active = false; };
    }, []);

    const setOperation = (type, operation) => {
        setOperations((current) => ({ ...current, [type]: operation }));
    };

    const upload = async (documentType, file, replacing = null) => {
        const validationError = validateDocumentFile(file);
        if (validationError) {
            setOperation(documentType, { phase: 'error', message: validationError });
            return;
        }

        try {
            if (replacing) {
                setOperation(documentType, { phase: 'deleting', message: 'Removing the existing document…' });
                try {
                    await deleteDocument(replacing.id);
                } catch (error) {
                    console.error('Unable to delete document before replacement', error.response?.status, error);
                    setOperation(documentType, { phase: 'error', message: friendlyDeleteError(error) });
                    return;
                }
            }

            setOperation(documentType, { phase: 'authorizing', message: 'Requesting a secure upload URL…' });
            const authorization = await requestDocumentUpload({
                documentType,
                originalFileName: file.name,
                contentType: file.type,
                fileSize: file.size,
            });

            setOperation(documentType, { phase: 'uploading', message: 'Uploading directly to secure storage…' });
            await uploadFileToR2(authorization.uploadUrl, file, authorization.requiredHeaders);

            setOperation(documentType, { phase: 'confirming', message: 'Confirming the upload…' });
            await confirmDocumentUpload(authorization.uploadIntentId);
            await onRefresh();
            setSelectedFiles((current) => ({ ...current, [documentType]: null }));
            setOperation(documentType, { phase: 'success', message: 'Document uploaded successfully.' });
        } catch (error) {
            console.error(`Unable to upload ${documentType}`, error);
            const r2Failure = !error.response && (error instanceof TypeError || error.message?.startsWith('Storage upload'));
            setOperation(documentType, {
                phase: 'error',
                message: apiMessage(error, r2Failure ? 'File upload to secure storage failed.' : 'Unable to upload this document.'),
            });
        }
    };

    const remove = async (document) => {
        if (!window.confirm('Delete this document?')) return;
        const type = document.documentType;
        setOperation(type, { phase: 'deleting', message: 'Deleting document…' });
        try {
            await deleteDocument(document.id);
            await onRefresh();
            setOperation(type, { phase: 'success', message: 'Document deleted.' });
        } catch (error) {
            console.error('Unable to delete document', error.response?.status, error);
            setOperation(type, { phase: 'error', message: friendlyDeleteError(error) });
        }
    };

    const view = async (document) => {
        const type = document.documentType;
        const viewWindow = window.open('about:blank', '_blank');
        if (viewWindow) viewWindow.opener = null;
        setOperation(type, { phase: 'viewing', message: 'Opening a secure document link…' });
        try {
            const viewAuthorization = await getDocumentViewUrl(document.id);
            if (viewWindow) {
                viewWindow.location.replace(viewAuthorization.url);
            } else {
                window.open(viewAuthorization.url, '_blank', 'noopener,noreferrer');
            }
            setOperation(type, null);
        } catch (error) {
            viewWindow?.close();
            console.error('Unable to view document', error);
            setOperation(type, { phase: 'error', message: apiMessage(error, 'Unable to open this document.') });
        }
    };

    return <div className="space-y-6">
        <div>
            <h3 className="mb-1 text-sm font-semibold text-slate-800">Required Documents</h3>
            <p className="text-xs text-slate-500">
                Upload your identity proof and educational certificate as PDF, PNG, or JPG files. Maximum file size: 2 MB each.
            </p>
        </div>

        {!isDraft && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Documents can only be changed while the application is in DRAFT status.
        </p>}

        {typesError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{typesError}</p>}

        <div className="grid gap-4">
            {requiredTypes.map(({ code, label }) => {
                const persisted = documents.filter((document) => document.documentType === code);
                return <DocumentCategory
                    key={code}
                    type={code}
                    label={label}
                    documents={persisted}
                    selectedFile={selectedFiles[code]}
                    operation={operations[code]}
                    disabled={!isDraft}
                    onSelect={(file) => {
                        setSelectedFiles((current) => ({ ...current, [code]: file }));
                        setOperation(code, null);
                    }}
                    onUpload={(file) => upload(code, file)}
                    onReplace={(document, file) => upload(code, file, document)}
                    onDelete={remove}
                    onView={view}
                />;
            })}
        </div>
    </div>;
}

function DocumentCategory({ type, label, documents, selectedFile, operation, disabled, onSelect, onUpload, onReplace, onDelete, onView }) {
    const inputRef = useRef(null);
    const replaceInputRef = useRef(null);
    const [replaceTarget, setReplaceTarget] = useState(null);
    const busy = operation && !['success', 'error'].includes(operation.phase);
    const alreadyUploaded = documents.length > 0;

    return <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                    <FileUp className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-800">{label} <span className="text-rose-500">*</span></h4>
                    <p className="text-xs text-slate-500">{documents.length ? 'Uploaded' : selectedFile ? 'Selected locally' : 'Not uploaded'}</p>
                </div>
            </div>

            {!disabled && <div className="flex flex-wrap items-center gap-2">
                <input ref={inputRef} type="file" className="hidden" accept="application/pdf,image/jpeg,image/png" disabled={disabled || busy || alreadyUploaded} onChange={(event) => onSelect(event.target.files?.[0] ?? null)} />
                <button type="button" disabled={disabled || busy || alreadyUploaded} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Paperclip className="h-3.5 w-3.5" /> Choose File
                </button>
                <button type="button" disabled={disabled || busy || alreadyUploaded || !selectedFile} onClick={() => onUpload(selectedFile)} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Upload className="h-3.5 w-3.5" /> Upload
                </button>
            </div>}
        </div>

        {selectedFile && <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
            Selected: <span className="font-semibold text-slate-800">{selectedFile.name}</span> ({formatSize(selectedFile.size)})
        </div>}

        {operation && <p role={operation.phase === 'error' ? 'alert' : 'status'} className={`border-t px-4 py-3 text-xs ${operation.phase === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : operation.phase === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
            {operation.message}
        </p>}

        {documents.map((document) => <div key={document.id} className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">{document.originalFileName}</p>
                <p className="mt-1 text-xs text-slate-400">
                    {formatSize(document.fileSize)} · {document.verificationStatus || 'PENDING'}
                    {document.uploadedAt ? ` · ${new Date(document.uploadedAt).toLocaleString()}` : ''}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => onView(document)} className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40"><Eye className="h-4 w-4" /> <span className="text-xs">View</span></button>
                {!disabled && <button type="button" disabled={busy} onClick={() => {
                    setReplaceTarget(document);
                    replaceInputRef.current?.click();
                }} className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"><RefreshCw className="h-4 w-4" /> <span className="text-xs">Replace</span></button>}
                {!disabled && <button type="button" disabled={busy} onClick={() => onDelete(document)} className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"><Trash2 className="h-4 w-4" /> <span className="text-xs">Delete</span></button>}
            </div>
        </div>)}

        <input ref={replaceInputRef} type="file" className="hidden" accept="application/pdf,image/jpeg,image/png" disabled={disabled} onChange={(event) => {
            const file = event.target.files?.[0];
            if (replaceTarget && file && window.confirm('Replace this document? The existing document must be deleted first.')) {
                onReplace(replaceTarget, file);
            }
            event.target.value = '';
            setReplaceTarget(null);
        }} />
        <span className="sr-only">{type}</span>
    </section>;
}
