import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

const statusColorClasses = {
  Applied: "bg-gray-100 text-gray-700",
  Shortlisted: "bg-emerald-100 text-emerald-700",
  "Interview Scheduled": "bg-indigo-100 text-indigo-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function ApplicantsTable({ items = [] }) {
  return (
    <Table>
      <TableCaption className="text-left">
        Recent teacher applicants.
      </TableCaption>
      <TableHeader>
        <TableRow className="bg-gray-50/70">
          <TableHead>Applicant</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_tr]:last:border-b">
        {items.map((applicant) => (
          <TableRow
            key={applicant.id || applicant.candidateCode || applicant.email}
            className="hover:bg-gray-50/80"
          >
            <TableCell className="font-medium">
              <div className="text-gray-900">{applicant.name}</div>
              <div className="text-xs text-gray-400">
                {applicant.candidateCode || applicant.id}
              </div>
            </TableCell>
            <TableCell className="text-gray-600">{applicant.department}</TableCell>
            <TableCell className="text-gray-600">{applicant.role}</TableCell>
            <TableCell className="text-gray-600">{applicant.email}</TableCell>
            <TableCell className="text-right">
              <Badge
                className={
                  "text-xs px-2.5 py-1 font-semibold rounded-full " +
                  (statusColorClasses[applicant.status] ||
                    "bg-gray-100 text-gray-700")
                }
              >
                {applicant.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
