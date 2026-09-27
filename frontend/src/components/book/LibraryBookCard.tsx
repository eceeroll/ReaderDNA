import type { ReadStatus, UserLibraryEntry } from "../../api/library";
import { Card } from "../ui/Card";
import { FieldError } from "../ui/FieldError";
import { LibraryMenu } from "../ui/LibraryMenu";
import { BookCoverInfo } from "./BookCoverInfo";

export function LibraryBookCard({
  entry,
  isUpdating,
  onStatusChange,
  onRequestRate,
  actionError = null,
}: {
  entry: UserLibraryEntry;
  isUpdating: boolean;
  onStatusChange: (id: number, status: ReadStatus) => void;
  onRequestRate: (id: number) => void;
  actionError?: string | null;
}) {
  return (
    <Card variant="interactive" className="group flex h-full flex-col p-4!">
      <BookCoverInfo book={entry.book} />

      <div className="mt-auto pt-4">
        <LibraryMenu
          status={entry.status}
          disabled={isUpdating}
          onSelect={(status) => {
            if (entry.status !== status) {
              onStatusChange(entry.id, status);
            }
            if (status === "READ") {
              onRequestRate(entry.id);
            }
          }}
        />
        {actionError !== null && (
          <FieldError className="mt-2" message={actionError} align="start" />
        )}
      </div>
    </Card>
  );
}
