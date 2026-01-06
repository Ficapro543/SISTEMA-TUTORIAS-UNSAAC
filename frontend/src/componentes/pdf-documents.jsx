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
                    <Text style={styles.label}>Estudiante:</Text>
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
                        <Text style={styles.label}>Estudiante:</Text>
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

// Componente PDF para constancia de tutoría individual
export const ConstanciaTutoriaPDF = ({ cronograma }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>SISTEMA DE TUTORIAS UNSAAC</Text>
            <Text style={styles.header}>CONSTANCIA DE TUTORÍA</Text>

            {/* Datos del Estudiante */}
            <View style={styles.section}>
                <Text style={{ fontSize: 12, marginBottom: 10, fontWeight: 'bold', color: '#1e3a8a' }}>
                    Datos del Estudiante
                </Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Nombre:</Text>
                    <Text style={styles.value}>{cronograma.estudiante.nombre}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Código:</Text>
                    <Text style={styles.value}>{cronograma.estudiante.codigo}</Text>
                </View>
            </View>

            {/* Datos de la Sesión */}
            <View style={styles.section}>
                <Text style={{ fontSize: 12, marginBottom: 10, fontWeight: 'bold', color: '#1e3a8a' }}>
                    Datos de la Sesión
                </Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Fecha:</Text>
                    <Text style={styles.value}>{cronograma.fecha}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Hora:</Text>
                    <Text style={styles.value}>{cronograma.horaInicio}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Aula:</Text>
                    <Text style={styles.value}>Aula {cronograma.aula}</Text>
                </View>
            </View>

            {/* Observaciones */}
            {cronograma.tutoria && (
                <>
                    <View style={styles.section}>
                        <Text style={{ fontSize: 12, marginBottom: 10, fontWeight: 'bold', color: '#1e3a8a' }}>
                            Observaciones
                        </Text>
                        <View style={{ marginBottom: 8 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Aspecto Académico:</Text>
                            <Text style={{ fontSize: 10, color: '#1f2937' }}>
                                {cronograma.tutoria.obsAcademico || 'Sin observaciones'}
                            </Text>
                        </View>
                        <View style={{ marginBottom: 8 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Aspecto Personal:</Text>
                            <Text style={{ fontSize: 10, color: '#1f2937' }}>
                                {cronograma.tutoria.obsPersonal || 'Sin observaciones'}
                            </Text>
                        </View>
                        <View style={{ marginBottom: 8 }}>
                            <Text style={{ ...styles.label, marginBottom: 4 }}>Aspecto Profesional:</Text>
                            <Text style={{ fontSize: 10, color: '#1f2937' }}>
                                {cronograma.tutoria.obsProfesional || 'Sin observaciones'}
                            </Text>
                        </View>
                    </View>

                    {/* Derivación Psicológica */}
                    {cronograma.tutoria.requiereDerivacion && (
                        <View style={styles.section}>
                            <Text style={{ fontSize: 12, marginBottom: 10, fontWeight: 'bold', color: '#dc2626' }}>
                                Derivación Psicológica
                            </Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Especialidad:</Text>
                                <Text style={styles.value}>{cronograma.tutoria.especialidad}</Text>
                            </View>
                            <View style={{ marginTop: 8 }}>
                                <Text style={{ ...styles.label, marginBottom: 4 }}>Motivo:</Text>
                                <Text style={{ fontSize: 10, color: '#1f2937' }}>
                                    {cronograma.tutoria.motivo}
                                </Text>
                            </View>
                        </View>
                    )}
                </>
            )}

            <Text style={styles.footer}>
                Sistema de Tutorías UNSAAC - Constancia generada el {new Date().toLocaleDateString('es-PE')}
            </Text>
        </Page>
    </Document>
);

// Componente PDF para lista de estudiantes que pasaron tutoría
export const ListaEstudiantesTutoriaPDF = ({ cronogramas, tutorNombre }) => {
    // Filtrar solo cronogramas con tutoría registrada
    const cronogramasConTutoria = cronogramas.filter(c => c.tutoria !== null);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>SISTEMA DE TUTORIAS UNSAAC</Text>
                <Text style={styles.header}>LISTA DE ESTUDIANTES ATENDIDOS</Text>
                <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 20, color: '#4b5563' }}>
                    Tutor: {tutorNombre}
                </Text>

                {/* Encabezado de tabla */}
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#1e3a8a',
                    padding: 8,
                    marginBottom: 10,
                    borderRadius: 3
                }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', width: 30 }}>#</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', width: 80 }}>Código</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', flex: 1 }}>Nombre</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', width: 80 }}>Fecha</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', width: 60 }}>Hora</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white', width: 50 }}>Aula</Text>
                </View>

                {/* Filas de la tabla */}
                {cronogramasConTutoria.map((cronograma, index) => (
                    <View
                        key={cronograma.id}
                        style={{
                            flexDirection: 'row',
                            padding: 8,
                            backgroundColor: index % 2 === 0 ? '#f3f4f6' : 'white',
                            borderBottomWidth: 1,
                            borderBottomColor: '#e5e7eb'
                        }}
                    >
                        <Text style={{ fontSize: 9, width: 30, color: '#1f2937' }}>{index + 1}</Text>
                        <Text style={{ fontSize: 9, width: 80, color: '#1f2937' }}>{cronograma.estudiante.codigo}</Text>
                        <Text style={{ fontSize: 9, flex: 1, color: '#1f2937' }}>{cronograma.estudiante.nombre}</Text>
                        <Text style={{ fontSize: 9, width: 80, color: '#1f2937' }}>{cronograma.fecha}</Text>
                        <Text style={{ fontSize: 9, width: 60, color: '#1f2937' }}>{cronograma.horaInicio}</Text>
                        <Text style={{ fontSize: 9, width: 50, color: '#1f2937' }}>{cronograma.aula}</Text>
                    </View>
                ))}

                <Text style={styles.footer}>
                    Sistema de Tutorías UNSAAC - Total: {cronogramasConTutoria.length} estudiantes atendidos - Generado el {new Date().toLocaleDateString('es-PE')}
                </Text>

                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `Página ${pageNumber} de ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

