'use strict';

var keystone = require('keystone');
var transform = require('model-transform');

var Types = keystone.Field.Types;

var Source = new keystone.List('Source', {
  defaultSort: '-time'
});

Source.add({
  url: { type: String, required: true, initial: true },
  time: { type: Types.Datetime, default: Date.now },
  vote: { type: Types.Relationship, ref: 'Vote', required: true, initial: true },
  likes: { type: Types.Relationship, ref: 'Like', many: true, noedit: true },
  score: { type: Types.Number, required: true, default: 1, format: false },
  title: { type: String },
  description: { type: String },
  image: { type: Types.Url },
  type: { type: String },
  latitude: { type: Types.Number },
  longitude: { type: Types.Number }
});

transform.toJSON(Source);

Source.defaultColumns = 'title, score, url';
Source.register();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvU291cmNlLmpzIl0sIm5hbWVzIjpbImtleXN0b25lIiwicmVxdWlyZSIsInRyYW5zZm9ybSIsIlR5cGVzIiwiRmllbGQiLCJTb3VyY2UiLCJMaXN0IiwiZGVmYXVsdFNvcnQiLCJhZGQiLCJ1cmwiLCJ0eXBlIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJpbml0aWFsIiwidGltZSIsIkRhdGV0aW1lIiwiZGVmYXVsdCIsIkRhdGUiLCJub3ciLCJ2b3RlIiwiUmVsYXRpb25zaGlwIiwicmVmIiwibGlrZXMiLCJtYW55Iiwibm9lZGl0Iiwic2NvcmUiLCJOdW1iZXIiLCJmb3JtYXQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiaW1hZ2UiLCJVcmwiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInRvSlNPTiIsImRlZmF1bHRDb2x1bW5zIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBV0MsUUFBUSxVQUFSLENBQWY7QUFDQSxJQUFJQyxZQUFZRCxRQUFRLGlCQUFSLENBQWhCOztBQUVBLElBQUlFLFFBQVFILFNBQVNJLEtBQVQsQ0FBZUQsS0FBM0I7O0FBRUEsSUFBSUUsU0FBUyxJQUFJTCxTQUFTTSxJQUFiLENBQWtCLFFBQWxCLEVBQTRCO0FBQ3ZDQyxlQUFhO0FBRDBCLENBQTVCLENBQWI7O0FBSUFGLE9BQU9HLEdBQVAsQ0FBVztBQUNUQyxPQUFLLEVBQUVDLE1BQU1DLE1BQVIsRUFBZ0JDLFVBQVUsSUFBMUIsRUFBZ0NDLFNBQVMsSUFBekMsRUFESTtBQUVUQyxRQUFNLEVBQUVKLE1BQU1QLE1BQU1ZLFFBQWQsRUFBd0JDLFNBQVNDLEtBQUtDLEdBQXRDLEVBRkc7QUFHVEMsUUFBTSxFQUFFVCxNQUFNUCxNQUFNaUIsWUFBZCxFQUE0QkMsS0FBSyxNQUFqQyxFQUF5Q1QsVUFBVSxJQUFuRCxFQUF5REMsU0FBUyxJQUFsRSxFQUhHO0FBSVRTLFNBQU8sRUFBRVosTUFBTVAsTUFBTWlCLFlBQWQsRUFBNEJDLEtBQUssTUFBakMsRUFBeUNFLE1BQU0sSUFBL0MsRUFBcURDLFFBQVEsSUFBN0QsRUFKRTtBQUtUQyxTQUFPLEVBQUVmLE1BQU1QLE1BQU11QixNQUFkLEVBQXNCZCxVQUFVLElBQWhDLEVBQXNDSSxTQUFTLENBQS9DLEVBQWtEVyxRQUFRLEtBQTFELEVBTEU7QUFNVEMsU0FBTyxFQUFFbEIsTUFBTUMsTUFBUixFQU5FO0FBT1RrQixlQUFhLEVBQUVuQixNQUFNQyxNQUFSLEVBUEo7QUFRVG1CLFNBQU8sRUFBRXBCLE1BQU1QLE1BQU00QixHQUFkLEVBUkU7QUFTVHJCLFFBQU0sRUFBRUEsTUFBTUMsTUFBUixFQVRHO0FBVVRxQixZQUFVLEVBQUV0QixNQUFNUCxNQUFNdUIsTUFBZCxFQVZEO0FBV1RPLGFBQVcsRUFBRXZCLE1BQU1QLE1BQU11QixNQUFkO0FBWEYsQ0FBWDs7QUFjQXhCLFVBQVVnQyxNQUFWLENBQWlCN0IsTUFBakI7O0FBRUFBLE9BQU84QixjQUFQLEdBQXdCLG1CQUF4QjtBQUNBOUIsT0FBTytCLFFBQVAiLCJmaWxlIjoiU291cmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGtleXN0b25lID0gcmVxdWlyZSgna2V5c3RvbmUnKTtcbnZhciB0cmFuc2Zvcm0gPSByZXF1aXJlKCdtb2RlbC10cmFuc2Zvcm0nKTtcblxudmFyIFR5cGVzID0ga2V5c3RvbmUuRmllbGQuVHlwZXM7XG5cbnZhciBTb3VyY2UgPSBuZXcga2V5c3RvbmUuTGlzdCgnU291cmNlJywge1xuICBkZWZhdWx0U29ydDogJy10aW1lJyxcbn0pO1xuXG5Tb3VyY2UuYWRkKHtcbiAgdXJsOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUsIGluaXRpYWw6IHRydWUgfSxcbiAgdGltZTogeyB0eXBlOiBUeXBlcy5EYXRldGltZSwgZGVmYXVsdDogRGF0ZS5ub3cgfSxcbiAgdm90ZTogeyB0eXBlOiBUeXBlcy5SZWxhdGlvbnNoaXAsIHJlZjogJ1ZvdGUnLCByZXF1aXJlZDogdHJ1ZSwgaW5pdGlhbDogdHJ1ZSB9LFxuICBsaWtlczogeyB0eXBlOiBUeXBlcy5SZWxhdGlvbnNoaXAsIHJlZjogJ0xpa2UnLCBtYW55OiB0cnVlLCBub2VkaXQ6IHRydWUgfSxcbiAgc2NvcmU6IHsgdHlwZTogVHlwZXMuTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSwgZGVmYXVsdDogMSwgZm9ybWF0OiBmYWxzZSB9LFxuICB0aXRsZTogeyB0eXBlOiBTdHJpbmcgfSxcbiAgZGVzY3JpcHRpb246IHsgdHlwZTogU3RyaW5nIH0sXG4gIGltYWdlOiB7IHR5cGU6IFR5cGVzLlVybCB9LFxuICB0eXBlOiB7IHR5cGU6IFN0cmluZyB9LFxuICBsYXRpdHVkZTogeyB0eXBlOiBUeXBlcy5OdW1iZXIgfSxcbiAgbG9uZ2l0dWRlOiB7IHR5cGU6IFR5cGVzLk51bWJlciB9LFxufSk7XG5cbnRyYW5zZm9ybS50b0pTT04oU291cmNlKTtcblxuU291cmNlLmRlZmF1bHRDb2x1bW5zID0gJ3RpdGxlLCBzY29yZSwgdXJsJztcblNvdXJjZS5yZWdpc3RlcigpO1xuIl19