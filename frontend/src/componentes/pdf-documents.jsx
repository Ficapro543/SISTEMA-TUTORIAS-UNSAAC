import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
    section: {
        marginBottom: 15,
        padding: 15,
        borderRadius: 5,
        backgroundColor: '#f3f4f6',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        width: 100,
        color: '#4b5563',
    },
    value: {
        fontSize: 10,
        flex: 1,
        color: '#1f2937',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#6b7280',
    },
    pageNumber: {
        fontSize: 8,
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 10,
    },
});

// Componente PDF para un solo cronograma
export const SingleCronogramaPDF = ({ cronograma }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>SISTEMA DE TUTORIAS UNSAAC</Text>
            <Text style={styles.header}>Cronograma de Tutoría</Text>

            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Fecha:</Text>
                    <Text style={styles.value}>{cronograma.fecha}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Horario:</Text>
                    <Text style={styles.value}>{cronograma.horario}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Aula:</Text>
                    <Text style={styles.value}>{cronograma.aula}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tutor:</Text>
                    <Text style={styles.value}>{cronograma.tutor}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Estudiantes:</Text>
                    <Text style={styles.value}>{cronograma.estudiantes}</Text>
                </View>
            </View>

            <Text style={styles.footer}>
                Sistema de Tutorías UNSAAC - Documento generado el {new Date().toLocaleDateString('es-PE')}
            </Text>
        </Page>
    </Document>
);

// Componente PDF para todos los cronogramas
export const AllCronogramasPDF = ({ cronogramas }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>SISTEMA DE TUTORIAS UNSAAC</Text>
            <Text style={styles.header}>Lista de Cronogramas de Tutorías</Text>

            {cronogramas.map((cronograma, index) => (
                <View key={cronograma.id} style={styles.section}>
                    <Text style={{ fontSize: 12, marginBottom: 8, fontWeight: 'bold' }}>
                        Cronograma #{index + 1}
                    </Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fecha:</Text>
                        <Text style={styles.value}>{cronograma.fecha}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Horario:</Text>
                        <Text style={styles.value}>{cronograma.horario}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Aula:</Text>
                        <Text style={styles.value}>{cronograma.aula}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tutor:</Text>
                        <Text style={styles.value}>{cronograma.tutor}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Estudiantes:</Text>
                        <Text style={styles.value}>{cronograma.estudiantes}</Text>
                    </View>
                </View>
            ))}

            <Text style={styles.footer}>
                Sistema de Tutorías UNSAAC - Total: {cronogramas.length} cronogramas - Generado el {new Date().toLocaleDateString('es-PE')}
            </Text>

            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                `Página ${pageNumber} de ${totalPages}`
            )} fixed />
        </Page>
    </Document>
);
