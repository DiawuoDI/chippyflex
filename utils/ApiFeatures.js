// const Movie = require("../models/movieModel");

class ApiFeatures{
     constructor(query, queryStr){
         this.query = query;
         this.queryStr = queryStr;
     }

     filter(){
        let queryString = JSON.stringify(this.queryStr);
        queryString = queryString.replace(/\b(gtr|gt|lte|lt)\b/g, (match) => '$${match}');
        const queryobj = JSON.parse(queryString);

        this.query = this.query.find(queryobj);

        return this;
     }

     limitfields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
         }else{
            this.query =query.select('-__v');
         }
         
         return this;
     }

     paginate(){
        const page = this.query.page*1 || 1;
        const limit = this.query.limit*1 || 10; 
        // page 1: 1-10, page 2: 11-20, page 3: 21-30
        const skip = (page -1) * limit;
        this.query= this.query.skip(skip).limit(limit);

        // if(this.query.page){
        //     const moviesCount = await Movie.countDocuments();
        //     if(skip >= moviesCount){
        //         throw new Error("This page not found");
        //     }  
        return this;
   
     }

}

module.exports = ApiFeatures;