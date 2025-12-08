"use client";

import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";

const ManageKpi = () => {
  const [pillar, setPillar] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  const [categoryId, setCategoryId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [metricType, setMetricType] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchPillars();
    fetchMetrics();
  }, []);

  const fetchPillars = async () => {
    const { data, error } = await supabase.from("kpi_categories").select("*");
    if (!error) setPillar(data);
  };

  const fetchMetrics = async () => {
    const { data, error } = await supabase.from("kpi_metrics").select("*");
    if (!error) setMetrics(data);
  };

  const getPillarName = (id: string) => {
    const found = pillar.find((p) => p.id === id);
    return found ? found.name : "Unknown Pillar";
  };

  const resetForm = () => {
    setEditId(null);
    setCategoryId("");
    setTitle("");
    setMetricType("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!categoryId || !title || !metricType) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from("kpi_metrics")
        .update({
          category_id: categoryId,
          title,
          metric_type: metricType,
        })
        .eq("id", editId);

      if (!error) {
        toast({
          title: "Updated",
          description: "KPI updated successfully!",
          variant: "success",
        });
        resetForm();
        fetchMetrics();
      }
    } else {
      const { error } = await supabase.from("kpi_metrics").insert([
        {
          category_id: categoryId,
          title,
          metric_type: metricType,
        },
      ]);

      if (!error) {
        toast({
          title: "Success",
          description: "New KPI created",
          variant: "success",
        });
        resetForm();
        fetchMetrics();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("kpi_metrics").delete().eq("id", id);

    if (!error) {
      toast({
        title: "Deleted",
        description: "KPI deleted successfully",
        variant: "success",
      });
      fetchMetrics();
    }
  };

  const editMetric = (item: any) => {
    setEditId(item.id);
    setCategoryId(item.category_id);
    setTitle(item.title);
    setMetricType(item.metric_type);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">

        <div className="text-center md:text-left mb-8">
          <h1 className="text-2xl font-bold ">KPI Management</h1>
          <p className="mt-2">Create and manage your KPI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className=" shadow-md rounded-xl p-6 lg:sticky lg:top-10 h-fit border">
            <h2 className="text-xl font-semibold  mb-6">
              {editId ? "Edit KPI" : "Create New KPI"}
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Pillar
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 border rounded-lg "
                >
                  <option value="">Select a Pillar</option>
                  {pillar.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium  mb-1">
                  KPI Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded-lg "
                />
              </div>

              <div>
                <label className="block text-sm font-medium  mb-1">
                  Metric Type
                </label>
                <input
                  type="text"
                  placeholder="eg: count"
                  value={metricType}
                  onChange={(e) => setMetricType(e.target.value)}
                  className="w-full p-3 border rounded-lg "
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                {editId ? "Update KPI" : "Create KPI"}
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

          <div className="lg:col-span-2">
            <div className=" shadow-md rounded-xl p-4 md:p-6 border">
              <h3 className="text-xl font-bold  mb-4">
                KPI List
              </h3>

              {metrics.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  No KPIs available.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {metrics.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition "
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">{item.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {getPillarName(item.category_id)}
                            </span>
                            <span className="px-3 py-1 border rounded-full text-xs">
                              {item.metric_type}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editMetric(item)}
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageKpi;
