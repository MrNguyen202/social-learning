

type ExercisedCardProps = {
    Exercise: any; // Replace 'any' with a more specific type if available
};

export function ExercisedCard({ Exercise }: ExercisedCardProps) {
    return (
        <div className="border rounded-lg p-4">
            {/* Exercise Type */}
            <div>
                {/* Icon */}
                <span className="">{}</span>
            </div>
        </div>
    );
}
