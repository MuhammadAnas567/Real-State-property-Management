const pagination = async (model, query, options) => {
  const { page = 1, limit = 10, populate = [] } = options;

  const skip = (page - 1) * limit;

  let mongooseQuery = model.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1});
  
  if (Array.isArray(populate) && populate.length > 0) {
    populate.forEach(p => {
      mongooseQuery = mongooseQuery.populate(p);
    });
  } else if (populate) {
    mongooseQuery = mongooseQuery.populate(populate);
  }

  const records = await mongooseQuery.exec();
  const count = await model.countDocuments(query);

  return {
    records,
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
    currentPage: Number(page),
  };
};

module.exports = pagination;
