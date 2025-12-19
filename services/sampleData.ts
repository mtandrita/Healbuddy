// Utility function to create sample data for testing

import { Prescription, Appointment, Notification } from '../types';
import { sendPrescriptionEmailNotification, sendPrescriptionSMSNotification } from './notificationService';

export const createSamplePrescription = async (userEmail: string, userName: string, mobileNumber?: string): Promise<void> => {
  const prescription: Prescription = {
    id: `PRX${Date.now()}`,
    appointmentId: 'apt123',
    doctorId: 'doc1',
    doctorName: 'Dr. Priya Sharma',
    patientId: userEmail,
    patientName: userName,
    date: new Date().toISOString(),
    diagnosis: 'Common Cold with mild fever',
    medications: [
      {
        name: 'Paracetamol 500mg',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '5 days',
        instructions: 'Take after meals'
      },
      {
        name: 'Vitamin C',
        dosage: '1000mg',
        frequency: 'Once daily',
        duration: '7 days',
        instructions: 'Take with water in the morning'
      },
      {
        name: 'Cetirizine 10mg',
        dosage: '10mg',
        frequency: 'Once daily (at night)',
        duration: '3 days',
        instructions: 'May cause drowsiness'
      }
    ],
    instructions: 'Rest adequately, drink plenty of fluids, and avoid cold beverages. Use a humidifier if needed.',
    followUp: 'Follow up after 5 days if symptoms persist or worsen.',
    createdAt: Date.now()
  };

  const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
  prescriptions.push(prescription);
  localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

  // Create notification
  const notification: Notification = {
    id: Date.now().toString(),
    userId: userEmail,
    type: 'prescription',
    title: 'New Prescription Available',
    message: `Dr. ${prescription.doctorName} has issued a new prescription for you`,
    read: false,
    createdAt: Date.now(),
    prescriptionId: prescription.id
  };

  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.push(notification);
  localStorage.setItem('notifications', JSON.stringify(notifications));

  // Send Email & SMS
  try {
    await sendPrescriptionEmailNotification(prescription, userEmail);
    console.log('✅ Prescription email sent');
    
    if (mobileNumber) {
      await sendPrescriptionSMSNotification(prescription, mobileNumber);
      console.log('✅ Prescription SMS sent');
    }
  } catch (error) {
    console.error('Notification sending failed:', error);
  }

  console.log('Sample prescription created with email/SMS notifications!');
};

export const createSampleAppointment = (userEmail: string): void => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointment: Appointment = {
    id: `APT${Date.now()}`,
    userId: userEmail,
    doctorId: 'doc2',
    doctorName: 'Dr. Rajesh Kumar',
    date: tomorrow.toISOString().split('T')[0],
    time: '14:30',
    status: 'scheduled',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    symptoms: 'Chest pain and shortness of breath',
    createdAt: Date.now()
  };

  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments.push(appointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));

  console.log('Sample appointment created!');
};
