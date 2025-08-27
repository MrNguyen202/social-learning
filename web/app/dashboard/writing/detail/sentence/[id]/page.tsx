"use client";
import { useParams } from 'next/navigation';

export default function PageExerciseDetail() {
    const { type, id } = useParams();

    return (
        <div>
            <h1>Writing Exercise Detail</h1>
            <p>Type: {type}</p>
            <p>ID: {id}</p>
        </div>
    );
}