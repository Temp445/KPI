"use client";

import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/authContext";

const ManageActionPlan = () => {
  const [pillar, setPillar] = useState<any[]>([]);
  const [actionPlans, setActionPlans] = useState<any[]>([]);

  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);

    const { user,loading } = useAuth();

  useEffect(() => {
    fetchPillars();
    fetchActionPlans();
  }, []);

  const fetchPillars = async () => {
    const { data, error } = await supabase.from("kpi_categories").select("*");
    if (!error) setPillar(data);
  };

  const fetchActionPlans = async () => {
    const { data, error } = await supabase.from("action_plans").select("*");
    if (!error) setActionPlans(data);
  };

  const resetForm = () => {
    setEditId(null);
    setCategoryId("");
    setTitle("");
    setDueDate("");
    setStatus("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!categoryId || !title || !dueDate || !status) {
      return toast({
        title: "Missing Fields",
        description: "Please fill all fields",
        variant: "destructive",
      });
    }

    if (editId) {
      const { error } = await supabase
        .from("action_plans")
        .update({
          category_id: categoryId,
          title,
          due_date: dueDate,
          status,
        })
        .eq("id", editId);

      if (!error) {
        toast({ title: "Updated", description: "Action Plan updated!", variant: "success" });
        resetForm();
        fetchActionPlans();
      }
      
      if (loading) return;
      if (!user) {
        toast({
          title: "Unauthorized",
          description: "Access denied. Only logged-in users can update this data.",
          variant: "destructive",
        });
        return;
      }

    } else {
      const { error } = await supabase.from("action_plans").insert([
        { category_id: categoryId, title, due_date: dueDate, status },
      ]);

      if (!error) {
        toast({ title: "Created", description: "New action plan added!", variant: "success" });
        resetForm();
        fetchActionPlans();
      }

      if (loading) return;
          if (!user) {
            toast({
              title: "Unauthorized",
              description: "Access denied. Only logged-in users can create new data.",
              variant: "destructive",
            });
            return;
          }
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setCategoryId(item.category_id);
    setTitle(item.title);
    setDueDate(item.due_date);
    setStatus(item.status);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("action_plans").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Action Plan removed", variant: "success" });
      fetchActionPlans();
    }
    if (loading) return;
        if (!user) {
          toast({
            title: "Unauthorized",
            description: "Access denied. Only logged-in users can delete this data.",
            variant: "destructive",
          });
          return;
        }
  };

  return (
    <div className="flex w-full p-6 gap-6">
      
      <div className=" lg:sticky lg:top-10 h-fit p-6 border rounded-md bg-white w-1/3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold mb-4">
            {editId ? "Edit Action Plan" : "Create Action Plan"}
          </h2>

          <div>
            <p className="font-medium mb-1">Pillar</p>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select a Pillar</option>
              {pillar.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <p className="font-medium mb-1">Title</p>
            <input
              className="w-full p-3 border rounded-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          {/* Date */}
          <div>
            <p className="font-medium mb-1">Due Date</p>
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <p className="font-medium mb-1">Status</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select status</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="open">Open</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium" type="submit" >
            {editId ? "Update Action Plan" : "Create Action Plan"}
          </button>
          {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-gray-300 hover:bg-gray-400 py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>
              )}
        </form>
      </div>

      <div className="flex-1 p-6 border rounded-md bg-white">
        <h2 className="text-xl font-bold mb-6">Action Plans</h2>

        {pillar.map((p) => {
          const items = actionPlans.filter((a) => a.category_id === p.id);
          if (items.length === 0) return null;

          return (
            <div key={p.id} className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <span className="text-sm text-gray-500">{items.length} actions</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
                  >
                    <h4 className="text-base font-semibold mb-2">{item.title}</h4>

                    <div className="flex items-center gap-4  mb-3">
                      <span className="text-sm text-gray-600">Due: {item.due_date}</span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium
                          ${
                            item.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.status === "overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                      >
                        {item.status}
                      </span>

                    </div>

                     <div className="flex items-end justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="hover:text-blue-800 p-2"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="hover:text-red-800 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManageActionPlan;
