import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../componentes/ui/Card";
import { Button } from "../../componentes/ui/Button";
import { Label } from "../../componentes/ui/Label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../componentes/ui/Dialog";
import { Download, Upload, Shield, FileArchive, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from '@/utils/api';
import styles from '@/styles/pages/admin/Seguridad.module.css';

const Seguridad = () => {
    const [isBackupLoading, setIsBackupLoading] = useState(false);
    const [isRestoreLoading, setIsRestoreLoading] = useState(false);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleBackup = async () => {
        setIsBackupLoading(true);
        try {
            const response = await api.get('/admin/backup/download', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup-sistema-${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            alert("Backup generado y descargado exitosamente.");
        } catch (error) {
            console.error(error);
            alert("Error al generar el backup.");
        } finally {
            setIsBackupLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.name.endsWith(".zip")) {
                setSelectedFile(file);
            } else {
                alert("Archivo inválido. Solo se permiten archivos ZIP.");
                event.target.value = null; // Reset input
            }
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) return;

        setIsRestoreLoading(true);

        const formData = new FormData();
        formData.append('backup', selectedFile);

        try {
            const response = await api.post('/admin/backup/restore', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(response.data.message || "La base de datos ha sido restaurada exitosamente.");
            setIsRestoreDialogOpen(false);
            setSelectedFile(null);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error al restaurar el sistema.");
        } finally {
            setIsRestoreLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <Shield className={`${styles.icon} ${styles.textPrimary}`} size={24} />
                    Seguridad del Sistema
                </h2>
                <p className={styles.subtitle}>
                    Gestión de copias de seguridad y restauración de datos
                </p>
            </div>

            {/* Action Cards */}
            <div className={styles.grid}>
                {/* Backup Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className={styles.flexCenter}>
                            <Download className={styles.textPrimary} size={20} />
                            Generar Backup
                        </CardTitle>
                        <CardDescription>
                            Crear una copia de seguridad completa del sistema en formato ZIP
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.infoBox}>
                            <div className={styles.infoRow}>
                                <FileArchive size={16} />
                                <span>Formato:</span>
                                <span className={styles.infoVal}>.zip</span>
                            </div>
                            {/* "Último backup" section removed as requested */}
                        </div>

                        <Button
                            className={styles.wFull}
                            style={{ marginTop: '1rem' }}
                            onClick={handleBackup}
                            disabled={isBackupLoading}
                        >
                            {isBackupLoading ? (
                                <>Generando backup...</>
                            ) : (
                                <>
                                    <Download className={styles.mr2} size={16} />
                                    Generar y Descargar Backup
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Restore Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className={styles.flexCenter}>
                            <Upload className={styles.textAmber} size={20} />
                            Restaurar Sistema
                        </CardTitle>
                        <CardDescription>
                            Restaurar el sistema desde un archivo de backup ZIP
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.warningBox}>
                            <div className={styles.warningContent}>
                                <AlertTriangle className={styles.textAmber} size={20} />
                                <div>
                                    <p className={styles.warningTitle}>
                                        Advertencia
                                    </p>
                                    <p className={styles.warningText}>
                                        La restauración reemplazará todos los datos actuales del sistema.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <Button
                                variant="outline"
                                className={styles.wFull}
                                onClick={() => setIsRestoreDialogOpen(true)}
                                style={{ borderColor: '#fcd34d', color: '#d97706' }}
                            >
                                <Upload className={styles.mr2} size={16} />
                                Subir Archivo de Backup
                            </Button>
                        </div>

                        <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Restaurar desde Backup</DialogTitle>
                                    <DialogDescription>
                                        Seleccione un archivo ZIP de backup para restaurar el sistema.
                                    </DialogDescription>
                                </DialogHeader>

                                <div style={{ padding: '1rem 0' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <Label htmlFor="backup-file">Archivo de Backup (.zip)</Label>
                                        <div className={styles.uploadZone}>
                                            <input
                                                id="backup-file"
                                                type="file"
                                                accept=".zip"
                                                onChange={handleFileSelect}
                                                className={styles.hiddenInput}
                                            />
                                            <label
                                                htmlFor="backup-file"
                                                className={styles.uploadLabel}
                                            >
                                                <FileArchive size={40} />
                                                <p>
                                                    {selectedFile ? (
                                                        <span style={{ color: '#3b82f6', fontWeight: 500 }}>{selectedFile.name}</span>
                                                    ) : (
                                                        "Haz clic para seleccionar un archivo ZIP"
                                                    )}
                                                </p>
                                            </label>
                                        </div>
                                    </div>

                                    {selectedFile && (
                                        <div className={styles.fileInfo}>
                                            <CheckCircle2 size={20} className={styles.textGreen} />
                                            <div>
                                                <p className={styles.fileName}>{selectedFile.name}</p>
                                                <p className={styles.fileSize}>
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsRestoreDialogOpen(false);
                                            setSelectedFile(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleRestore}
                                        disabled={!selectedFile || isRestoreLoading}
                                        style={{ backgroundColor: '#d97706', color: 'white' }}
                                    >
                                        {isRestoreLoading ? 'Restaurando...' : 'Restaurar Sistema'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Seguridad;
