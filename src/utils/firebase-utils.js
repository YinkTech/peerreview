// src/utils/firebase-utils.js
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createGroup(groupData) {
  try {
    const groupRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: new Date().toISOString(),
      members: []
    });
    return {
      id: groupRef.id,
      ...groupData
    };
  } catch (error) {
    console.error('Error in createGroup:', error);
    throw error;
  }
}

export async function getGroups() {
  try {
    const groupsQuery = query(collection(db, 'groups'));
    const snapshot = await getDocs(groupsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error in getGroups:', error);
    throw error;
  }
}

export async function getGroupMembers(groupId) {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('groupId', '==', groupId)
    );
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error('Failed to fetch group members');
  }
}