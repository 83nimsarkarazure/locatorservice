import mongoose, { Document, Schema } from 'mongoose';

interface StudentDoc extends Document {
  firstName: string;
  lastName: string;
  age: number;

}

const studentSchema = new Schema<StudentDoc>({
  firstName: String,
  lastName: String,
  age: Number,

});

export default mongoose.model<StudentDoc>('Student', studentSchema);

